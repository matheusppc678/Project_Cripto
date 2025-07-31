export const analyzeCrypto = (
  crypto: any,
  predicted30DayPrice?: number // New optional parameter for 30-day prediction
) => {
  const priceChange24h = crypto.priceChange24h || 0;
  const currentPrice = crypto.currentPrice || 0;

  let recommendation = "Manter";
  let score = 50; // Neutral default

  if (predicted30DayPrice !== undefined && currentPrice > 0) {
    // New logic based on 30-day prediction
    if (predicted30DayPrice > currentPrice * 1.05) {
      recommendation = "Comprar";
      score = 80; // High score for strong buy
    } else if (predicted30DayPrice < currentPrice * 0.95) {
      recommendation = "Vender";
      score = 20; // Low score for strong sell
    } else {
      recommendation = "Manter";
      score = 50; // Neutral
    }
  } else {
    // Existing logic based on 24h price change (fallback for list views)
    if (priceChange24h > 5) {
      score = 75; // Strong buy
    } else if (priceChange24h > 2) {
      score = 65; // Buy
    } else if (priceChange24h < -5) {
      score = 25; // Strong sell
    } else if (priceChange24h < -2) {
      score = 35; // Sell
    }

    if (score > 60) {
      recommendation = "Comprar";
    } else if (score < 31) {
      recommendation = "Vender";
    }
  }

  return { recommendation, score: Math.round(score) };
};