import { Crypto } from "@/interfaces/Crypto";

const BASE_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const DEFAULT_PARAMS = 'vs_currency=usd&order=market_cap_desc&sparkline=false';

export const fetchTop10Cryptos = async (): Promise<Crypto[]> => {
  return fetchCryptos(10);
};

export const fetchTop100Cryptos = async (): Promise<Crypto[]> => {
  return fetchCryptos(100);
};

const fetchCryptos = async (count: number): Promise<Crypto[]> => {
  try {
    const response = await fetch(`${BASE_URL}?${DEFAULT_PARAMS}&per_page=${count}&page=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    const data = await response.json();
    
    return data.map((crypto: any) => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      price: crypto.current_price,
      priceChange24h: crypto.price_change_percentage_24h,
      marketCap: crypto.market_cap,
      potentialProfit: calculatePotentialProfit(crypto.price_change_percentage_24h),
      details: `Current price: $${crypto.current_price.toFixed(2)} | Market cap: $${crypto.market_cap.toLocaleString()}`,
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
};

const calculatePotentialProfit = (priceChange24h: number): number => {
  return Math.min(Math.max(priceChange24h * 3, 1), 20);
};