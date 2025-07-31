export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  potentialProfit: number;
  details: string;
  currentPrice?: number;
  priceChange24h?: number;
  predicted30DayPrice?: number; // NEW: Predicted price in 30 days
}