import { Crypto } from "@/interfaces/Crypto";

// Helper functions for prediction moved from CryptoDetail.tsx
const calculateMovingAverage = (data: { price: number }[], period: number): number[] => {
  const movingAverages: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].price;
    }
    movingAverages.push(sum / period);
  }
  return movingAverages;
};

const calculateVolatility = (data: { price: number }[]): number => {
  const prices = data.map(item => item.price);
  if (prices.length === 0) return 0;
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squaredDifferences = prices.map(price => Math.pow(price - avgPrice, 2));
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / prices.length;
  return Math.sqrt(variance);
};

const generateRealisticPredictions = (historicalData: { price: number }[]): number | undefined => {
  if (historicalData.length < 30) return undefined; // Need enough data for 30-day MA
  const movingAverages = calculateMovingAverage(historicalData, 30);
  const volatility = calculateVolatility(historicalData);
  const lastPrice = historicalData[historicalData.length - 1].price;
  
  // Use the last moving average as a base for prediction
  const basePrice = movingAverages.length > 0 ? movingAverages[movingAverages.length - 1] : lastPrice;
  
  // Simulate 30 days of prediction, taking the last predicted price
  let predictedPrice = basePrice;
  for (let i = 1; i <= 30; i++) {
    const fluctuation = (Math.random() - 0.5) * 2 * volatility;
    predictedPrice += fluctuation;
    predictedPrice = Math.max(0, predictedPrice); // Ensure price doesn't go below zero
  }
  
  return predictedPrice; // Return only the final predicted price
};

const BASE_LIST_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&sparkline=false';

export const fetchCryptosWithPredictions = async (limit: number = 10): Promise<Crypto[]> => {
  try {
    // Fetch initial list of cryptos
    const listResponse = await fetch(`${BASE_LIST_API_URL}&per_page=${limit}&page=1`);
    if (!listResponse.ok) {
      throw new Error('Failed to fetch crypto list');
    }
    const listData = await listResponse.json();

    const cryptosWithPredictions: Crypto[] = [];

    // Fetch historical data concurrently for each crypto
    const fetchPromises = listData.map(async (cryptoItem: any) => {
      try {
        const historicalResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${cryptoItem.id}/market_chart?vs_currency=usd&days=90&interval=daily`
        );
        if (!historicalResponse.ok) {
          console.warn(`Failed to fetch historical data for ${cryptoItem.id}. Skipping prediction.`);
          return {
            id: cryptoItem.id,
            name: cryptoItem.name,
            symbol: cryptoItem.symbol,
            potentialProfit: 0, 
            details: `Current price: $${cryptoItem.current_price.toFixed(2)} | Market cap: $${cryptoItem.market_cap.toLocaleString()}`,
            currentPrice: cryptoItem.current_price,
            priceChange24h: cryptoItem.price_change_percentage_24h,
            predicted30DayPrice: undefined // No prediction if historical data fails
          };
        }
        const historicalDataRaw = await historicalResponse.json();
        const formattedHistoricalData = historicalDataRaw.prices.map((item: [number, number]) => ({
          date: new Date(item[0]).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          price: item[1]
        }));

        const predicted30DayPrice = generateRealisticPredictions(formattedHistoricalData);

        return {
          id: cryptoItem.id,
          name: cryptoItem.name,
          symbol: cryptoItem.symbol,
          potentialProfit: 0, 
          details: `Current price: $${cryptoItem.current_price.toFixed(2)} | Market cap: $${cryptoItem.market_cap.toLocaleString()}`,
          currentPrice: cryptoItem.current_price,
          priceChange24h: cryptoItem.price_change_percentage_24h,
          predicted30DayPrice: predicted30DayPrice
        };
      } catch (error) {
        console.error(`Error fetching historical data for ${cryptoItem.id}:`, error);
        return {
          id: cryptoItem.id,
          name: cryptoItem.name,
          symbol: cryptoItem.symbol,
          potentialProfit: 0,
          details: `Current price: $${cryptoItem.current_price.toFixed(2)} | Market cap: $${cryptoItem.market_cap.toLocaleString()}`,
          currentPrice: cryptoItem.current_price,
          priceChange24h: cryptoItem.price_change_percentage_24h,
          predicted30DayPrice: undefined
        };
      }
    });

    cryptosWithPredictions.push(...(await Promise.all(fetchPromises)));
    return cryptosWithPredictions;

  } catch (error) {
    console.error('Error fetching cryptos with predictions:', error);
    return [];
  }
};