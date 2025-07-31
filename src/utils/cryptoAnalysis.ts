export const analyzeCrypto = ({
  currentPrice,
  predictedPrice,
  priceChange24h,
}: {
  currentPrice?: number;
  predictedPrice?: number;
  priceChange24h?: number;
}) => {
  let recommendation = "Manter";
  let score = 50;

  if (currentPrice !== undefined && predictedPrice !== undefined) {
    // Lógica para a página de detalhes (onde a previsão está disponível)
    if (predictedPrice > currentPrice * 1.05) {
      recommendation = "Comprar";
      score = 90; // Alta confiança de compra
    } else if (predictedPrice < currentPrice * 0.95) {
      recommendation = "Vender";
      score = 10; // Alta confiança de venda
    } else {
      recommendation = "Manter";
      // Pontuação baseada na proximidade dos limites
      const diffPercentage = (predictedPrice - currentPrice) / currentPrice;
      if (diffPercentage >= 0.02) score = 70; // Leve tendência positiva
      else if (diffPercentage <= -0.02) score = 30; // Leve tendência negativa
      else score = 50; // Estável
    }
  } else if (priceChange24h !== undefined) {
    // Lógica de fallback para as páginas de lista (onde apenas a variação de 24h está disponível)
    if (priceChange24h > 5) {
      recommendation = "Comprar";
      score = 75;
    } else if (priceChange24h > 2) {
      recommendation = "Comprar";
      score = 65;
    } else if (priceChange24h < -5) {
      recommendation = "Vender";
      score = 25;
    } else if (priceChange24h < -2) {
      recommendation = "Vender";
      score = 35;
    } else {
      recommendation = "Manter";
      score = 50;
    }
  }

  return { recommendation, score: Math.round(score) };
};