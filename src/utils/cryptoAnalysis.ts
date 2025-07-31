import { Crypto } from "@/interfaces/Crypto";

interface HistoricalDataPoint {
  date: string;
  price: number;
}

// Função para calcular a média móvel
export const calculateMovingAverage = (data: HistoricalDataPoint[], period: number): number[] => {
  const movingAverages: number[] = [];
  if (data.length < period) return []; // Dados insuficientes para o período
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].price;
    }
    movingAverages.push(sum / period);
  }
  return movingAverages;
};

// Função para calcular a volatilidade
export const calculateVolatility = (data: HistoricalDataPoint[]): number => {
  if (data.length < 2) return 0; // Necessita de pelo menos dois pontos de dados para volatilidade
  const prices = data.map(item => item.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squaredDifferences = prices.map(price => Math.pow(price - avgPrice, 2));
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / prices.length;
  return Math.sqrt(variance);
};

// Função para gerar previsões realistas
export const generateRealisticPredictions = (historicalData: HistoricalDataPoint[]): { date: string; price: number; predicted: boolean }[] => {
  if (historicalData.length === 0) return [];

  const movingAverages = calculateMovingAverage(historicalData, 30);
  const volatility = calculateVolatility(historicalData);
  const lastPrice = historicalData[historicalData.length - 1].price;
  const predictedData: { date: string; price: number; predicted: boolean }[] = [];
  
  for (let i = 1; i <= 30; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const date = futureDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
    
    // Usa a média móvel como base, ou o último preço se a média móvel não estiver disponível
    const basePrice = movingAverages.length > 0 ? movingAverages[movingAverages.length - 1] : lastPrice;
    
    // Adiciona uma flutuação aleatória baseada na volatilidade, escalada para previsão diária
    const fluctuation = (Math.random() - 0.5) * 2 * volatility * 0.1; // Flutuação reduzida
    let predictedPrice = basePrice + fluctuation;
    
    // Garante que o preço não caia abaixo de zero
    predictedPrice = Math.max(0.000001, predictedPrice); // Menor número positivo
    
    predictedData.push({
      date: date,
      price: predictedPrice,
      predicted: true
    });
  }
  
  return predictedData;
};

export const getRecommendationAndScore = ({
  currentPrice,
  predictedPrice,
}: {
  currentPrice?: number;
  predictedPrice?: number;
}) => {
  let recommendation = "Manter";
  let score = 50;

  if (currentPrice !== undefined && predictedPrice !== undefined) {
    if (predictedPrice > currentPrice * 1.05) { // Previsão 5% maior que o preço atual
      recommendation = "Comprar";
      score = 90; // Alta confiança de compra
    } else if (predictedPrice < currentPrice * 0.95) { // Previsão 5% menor que o preço atual
      recommendation = "Vender";
      score = 10; // Alta confiança de venda
    } else {
      recommendation = "Manter";
      // Pontuação baseada na proximidade dos limites
      const diffPercentage = (predictedPrice - currentPrice) / currentPrice;
      if (diffPercentage >= 0.02) score = 70; // Leve tendência positiva (2% a 5%)
      else if (diffPercentage <= -0.02) score = 30; // Leve tendência negativa (-2% a -5%)
      else score = 50; // Estável (-2% a 2%)
    }
  }
  // Se predictedPrice for undefined, a recomendação e a pontuação permanecem nos valores iniciais ("Manter", 50).

  return { recommendation, score: Math.round(score) };
};