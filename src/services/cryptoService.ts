import { Crypto } from "@/interfaces/Crypto";

const CRYPTOCOMPARE_API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com/data';

const headers = CRYPTOCOMPARE_API_KEY ? { 'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}` } : {};

/**
 * Busca as top N criptomoedas por capitalização de mercado e seus detalhes de preço.
 * @param limit O número de criptomoedas a serem buscadas (padrão: 100).
 * @returns Uma promessa que resolve para um array de objetos Crypto.
 */
export const fetchTopCryptos = async (limit: number = 100): Promise<Crypto[]> => {
  try {
    const response = await fetch(`${BASE_URL}/top/mktcapfull?limit=${limit}&tsym=USD`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch top crypto data: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.Data || data.Data.length === 0) {
      console.warn("No data received from CryptoCompare top/mktcapfull endpoint.");
      return [];
    }

    // Extrai os símbolos das moedas para buscar os preços detalhados
    const symbols = data.Data.map((item: any) => item.CoinInfo.Name);
    const detailedPrices = await fetchCryptoPrices(symbols);

    return data.Data.map((item: any) => {
      const symbol = item.CoinInfo.Name;
      const priceData = detailedPrices.find(dp => dp.symbol.toUpperCase() === symbol.toUpperCase());

      return {
        id: item.CoinInfo.FullName.toLowerCase().replace(/\s/g, '-'), // Cria um slug para o ID de roteamento
        name: item.CoinInfo.FullName,
        symbol: symbol,
        potentialProfit: calculatePotentialProfit(priceData?.priceChange24h || 0),
        details: `Current price: $${priceData?.currentPrice?.toFixed(2) || 'N/A'} | Market cap: $${item.RAW?.USD?.MKTCAP?.toLocaleString() || 'N/A'}`,
        currentPrice: priceData?.currentPrice,
        priceChange24h: priceData?.priceChange24h
      };
    });

  } catch (error) {
    console.error('Error fetching top crypto data:', error);
    return [];
  }
};

/**
 * Busca preços detalhados para uma lista de símbolos de criptomoedas.
 * @param symbols Um array de símbolos de criptomoedas (ex: ['BTC', 'ETH']).
 * @returns Uma promessa que resolve para um array de objetos Crypto com preços e variações.
 */
export const fetchCryptoPrices = async (symbols: string[]): Promise<Crypto[]> => {
  if (symbols.length === 0) return [];
  try {
    const response = await fetch(`${BASE_URL}/pricemultifull?fsyms=${symbols.join(',')}&tsyms=USD`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch crypto prices: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.RAW) {
      console.warn("No RAW data received from CryptoCompare pricemultifull endpoint.");
      return [];
    }

    const cryptos: Crypto[] = [];
    for (const symbol of symbols) {
      const rawData = data.RAW[symbol]?.USD;
      if (rawData) {
        cryptos.push({
          id: rawData.FROMSYMBOL.toLowerCase(), // Temporário, será sobrescrito por fetchTopCryptos
          name: rawData.FROMSYMBOL, // Temporário, será sobrescrito por fetchTopCryptos
          symbol: rawData.FROMSYMBOL,
          potentialProfit: calculatePotentialProfit(rawData.CHANGEPCT24HOUR),
          details: `Current price: $${rawData.PRICE.toFixed(2)} | Market cap: $${rawData.MKTCAP?.toLocaleString() || 'N/A'}`,
          currentPrice: rawData.PRICE,
          priceChange24h: rawData.CHANGEPCT24HOUR
        });
      }
    }
    return cryptos;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return [];
  }
};

/**
 * Busca dados históricos diários para uma única criptomoeda.
 * @param symbol O símbolo da criptomoeda (ex: 'BTC').
 * @param days O número de dias de dados históricos a serem buscados (padrão: 90).
 * @returns Uma promessa que resolve para um array de objetos com data e preço.
 */
export const fetchHistoricalData = async (symbol: string, days: number = 90): Promise<{ date: string; price: number }[]> => {
  try {
    const response = await fetch(`${BASE_URL}/v2/histoday?fsym=${symbol}&tsym=USD&limit=${days}`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.Data || !data.Data.Data || data.Data.Data.length === 0) {
      console.warn(`No historical data received for ${symbol}.`);
      return [];
    }

    return data.Data.Data.map((item: any) => ({
      date: new Date(item.time * 1000).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      price: item.close
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
};

const calculatePotentialProfit = (priceChange24h: number): number => {
  // Cálculo simples baseado na variação de 24h
  return Math.min(Math.max(priceChange24h * 3, 1), 20); // Limita entre 1% e 20%
};