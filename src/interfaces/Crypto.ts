export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  potentialProfit: number;
  details: string;
  currentPrice?: number;
  priceChange24h?: number;
}