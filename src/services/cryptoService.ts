import { Crypto } from "@/interfaces/Crypto";

const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

export const fetchCryptos = async (): Promise<Crypto[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    const data = await response.json();
    
    return data.map((crypto: any) => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      potentialProfit: calculatePotentialProfit(crypto.price_change_percentage_24h),
      details: `Current price: $${crypto.current_price.toFixed(2)} | Market cap: $${crypto.market_cap.toLocaleString()}`,
      currentPrice: crypto.current_price,
      priceChange24h: crypto.price_change_percentage_24h
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
};

const calculatePotentialProfit = (priceChange24h: number): number => {
  // Simple calculation based on 24h change
  return Math.min(Math.max(priceChange24h * 3, 1), 20); // Cap between 1% and 20%
};