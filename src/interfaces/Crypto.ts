export interface Crypto {
  id: string; // e.g., "bitcoin" (slug para roteamento)
  name: string; // e.g., "Bitcoin" (nome completo)
  symbol: string; // e.g., "BTC"
  potentialProfit: number;
  details: string;
  currentPrice?: number;
  priceChange24h?: number;
  predictedPrice?: number; // Novo campo para a previsão de 30 dias
}