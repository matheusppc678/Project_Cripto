"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';
import { analyzeCrypto } from '@/utils/cryptoAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Home } from 'lucide-react';

interface HistoricalDataPoint {
  date: string;
  price: number;
}

interface PredictionDataPoint {
  date: string;
  price: number;
  predicted: boolean;
}

const CryptoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [crypto, setCrypto] = useState<Crypto | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<(HistoricalDataPoint | PredictionDataPoint)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch crypto details
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch crypto data');
        }
        const data = await response.json();
        
        const cryptoData: Crypto = {
          id: data.id,
          name: data.name,
          symbol: data.symbol,
          potentialProfit: 0, // Will be calculated
          details: `Current price: $${data.market_data.current_price.usd.toFixed(2)} | Market cap: $${data.market_data.market_cap.usd.toLocaleString()}`,
          currentPrice: data.market_data.current_price.usd,
          priceChange24h: data.market_data.price_change_percentage_24h
        };
        
        setCrypto(cryptoData);
        
        // Fetch historical data (90 days)
        const historicalResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=90&interval=daily`
        );
        
        if (!historicalResponse.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const historicalDataRaw = await historicalResponse.json();
        const formattedHistoricalData = historicalDataRaw.prices.map((item: [number, number]) => ({
          date: new Date(item[0]).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          price: item[1]
        }));
        
        setHistoricalData(formattedHistoricalData);
        
        // Refined prediction algorithm
        const predictedData = generateRealisticPredictions(formattedHistoricalData);
        setPredictionData(predictedData);
        
        // Combine historical and prediction data for chart
        const combinedData = [
          ...formattedHistoricalData,
          ...predictedData
        ];
        
        setChartData(combinedData);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Function to calculate moving average
  const calculateMovingAverage = (data: HistoricalDataPoint[], period: number): number[] => {
    const movingAverages: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].price;
      }
      movingAverages.push(sum / period);
    }
    return movingAverages;
  };

  // Function to calculate volatility
  const calculateVolatility = (data: HistoricalDataPoint[]): number => {
    const prices = data.map(item => item.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const squaredDifferences = prices.map(price => Math.pow(price - avgPrice, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / prices.length;
    return Math.sqrt(variance);
  };

  // Function to generate realistic predictions (for chart display)
  const generateRealisticPredictions = (historicalData: HistoricalDataPoint[]): PredictionDataPoint[] => {
    const movingAverages = calculateMovingAverage(historicalData, 30);
    const volatility = calculateVolatility(historicalData);
    const lastPrice = historicalData[historicalData.length - 1].price;
    const predictedData: PredictionDataPoint[] = [];
    
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const date = futureDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      
      // Use moving average as a base
      const basePrice = movingAverages.length > 0 ? movingAverages[movingAverages.length - 1] : lastPrice;
      
      // Add a random fluctuation based on volatility
      const fluctuation = (Math.random() - 0.5) * 2 * volatility;
      let predictedPrice = basePrice + fluctuation;
      
      // Ensure the price doesn't go below zero
      predictedPrice = Math.max(0, predictedPrice);
      
      predictedData.push({
        date: date,
        price: predictedPrice,
        predicted: true
      });
    }
    
    return predictedData;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Carregando detalhes da criptomoeda...</p>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Criptomoeda não encontrada</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            Voltar
          </Button>
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Ir para Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Pass the predicted 30-day price to analyzeCrypto
  const predicted30DayPrice = predictionData[predictionData.length - 1]?.price;
  const { recommendation, score } = analyzeCrypto(crypto, predicted30DayPrice);
  const isPositive = crypto.priceChange24h >= 0;

  // Generate recommendation reason based on analysis
  let recommendationReason = "";
  if (recommendation === "Comprar") {
    recommendationReason = "Com base na previsão de 30 dias, espera-se um aumento significativo no preço, indicando uma boa oportunidade de compra.";
  } else if (recommendation === "Vender") {
    recommendationReason = "Com base na previsão de 30 dias, espera-se uma queda significativa no preço, sugerindo uma oportunidade de venda.";
  } else {
    recommendationReason = "A previsão de 30 dias indica que o preço deve permanecer relativamente estável, sem grandes variações.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{crypto.name} ({crypto.symbol.toUpperCase()})</h1>
            <p className="text-muted-foreground">Análise detalhada e previsões</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Link to="/">
              <Button className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Preço Atual e Previsão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      interval={Math.floor(chartData.length / 10)}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Preço']}
                      labelFormatter={(label) => `Data: ${label}`}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      activeDot={{ r: 8 }}
                      name="Histórico"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--accent))"
                      strokeDasharray="3 3"
                      name="Previsão"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Atuais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Preço Atual</h3>
                  <p className="text-3xl font-bold">${crypto.currentPrice?.toFixed(2)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Variação 24h</h3>
                  <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-5 w-5 mr-2" /> : <TrendingDown className="h-5 w-5 mr-2" />}
                    <span className="text-2xl font-bold">
                      {crypto.priceChange24h ? `${crypto.priceChange24h >= 0 ? '+' : ''}${crypto.priceChange24h.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Recomendação</h3>
                  <Badge 
                    variant={recommendation === 'Comprar' ? 'default' : recommendation === 'Vender' ? 'destructive' : 'secondary'}
                    className="text-lg py-2 px-4 mt-1"
                  >
                    {recommendation}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Pontuação de Atratividade</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-3xl font-bold">{score}</span>
                    <span className="text-muted-foreground ml-1 text-lg">/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Motivo da Recomendação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{recommendationReason}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Previsão Estimada para 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {predictionData.slice(0, 15).map((item, index) => (
                <div key={index} className="border rounded-lg p-3 text-center bg-card">
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Previsão baseada na tendência dos últimos 30 dias. O preço estimado em 30 dias é de <span className="font-bold">${predictionData[predictionData.length - 1]?.price.toFixed(2) || 'N/A'}</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CryptoDetail;