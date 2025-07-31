export const analyzeCrypto = (crypto: any) => {
  // Use the 24h price change as a base for our analysis
  const priceChange = crypto.priceChange24h || 0;
  
  // Calculate attractiveness score based on price change
  let score = 50; // Neutral

  if (priceChange > 5) {
    score = 75; // Strong buy
  } else if (priceChange > 2) {
    score = 65; // Buy
  } else if (priceChange < -5) {
    score = 25; // Strong sell
  } else if (priceChange < -2) {
    score = 35; // Sell
  }

  // Recommendation
  let recommendation = "Manter";
  if (score > 60) {
    recommendation = "Comprar";
  } else if (score < 31) {
    recommendation = "Vender";
  }

  return { recommendation, score: Math.round(score) };
};