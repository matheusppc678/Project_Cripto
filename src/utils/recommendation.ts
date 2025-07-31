export const getRecommendation = (currentPrice: number, predicted30DayPrice: number): "Comprar" | "Vender" | "Manter" => {
  if (predicted30DayPrice > currentPrice * 1.05) {
    return "Comprar";
  } else if (predicted30DayPrice < currentPrice * 0.95) {
    return "Vender";
  } else {
    return "Manter";
  }
};