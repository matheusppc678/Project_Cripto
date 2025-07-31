import { getRecommendation } from './recommendation';

export const analyzeCrypto = (
  crypto: any,
  predicted30DayPrice?: number // Optional parameter for 30-day prediction
) => {
  const currentPrice = crypto.currentPrice || 0;

  let recommendation: "Comprar" | "Vender" | "Manter" = "Manter";
  let score = 50; // Neutral default

  if (predicted30DayPrice !== undefined && currentPrice > 0) {
    // Use the 30-day prediction for recommendation
    recommendation = getRecommendation(currentPrice, predicted30DayPrice);

    // Adjust score based on the new recommendation
    if (recommendation === "Comprar") {
      score = 80; // High score for strong buy
    } else if (recommendation === "Vender") {
      score = 20; // Low score for strong sell
    } else {
      score = 50; // Neutral
    }
  } else {
    // If 30-day prediction is not available, default to "Manter" and neutral score.
    // The 24h price change is no longer used for recommendation logic as per user's request.
    recommendation = "Manter";
    score = 50;
  }

  return { recommendation, score: Math.round(score) };
};