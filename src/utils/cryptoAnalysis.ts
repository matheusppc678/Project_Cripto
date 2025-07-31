export const analyzeCrypto = (crypto: any) => {
  // Mock data for historical prices and volume
  const historicalData = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const price =
      crypto.potentialProfit +
      Math.sin(i / 10) * (crypto.potentialProfit / 5);
    const volume = 1000 + Math.random() * 500;
    return { date, price, volume };
  });

  // Calculate 60-day average price
  const sixtyDayPrices = historicalData.slice(0, 60).map((d) => d.price);
  const averagePrice =
    sixtyDayPrices.reduce((sum, price) => sum + price, 0) /
    sixtyDayPrices.length;

  // Determine trend (simple moving average)
  const recentAverage =
    historicalData
      .slice(0, 7)
      .map((d) => d.price)
      .reduce((sum, price) => sum + price, 0) / 7;
  const pastAverage =
    historicalData
      .slice(7, 14)
      .map((d) => d.price)
      .reduce((sum, price) => sum + price, 0) / 7;
  const isTrendingUp = recentAverage > pastAverage;

  // Determine volume trend
  const recentVolume =
    historicalData
      .slice(0, 7)
      .map((d) => d.volume)
      .reduce((sum, volume) => sum + volume, 0) / 7;
  const pastVolume =
    historicalData
      .slice(7, 14)
      .map((d) => d.volume)
      .reduce((sum, volume) => sum + volume, 0) / 7;
  const isVolumeIncreasing = recentVolume > pastVolume;

  // Calculate attractiveness score
  let score = 50; // Neutral

  if (isTrendingUp && crypto.potentialProfit > averagePrice && isVolumeIncreasing) {
    score = 75; // Buy
  } else if (!isTrendingUp && crypto.potentialProfit > averagePrice) {
    score = 25; // Sell
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