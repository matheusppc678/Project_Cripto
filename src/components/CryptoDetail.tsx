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
  timestamp: number;
}

interface PredictionDataPoint {
  date: string;
  price: number;
  predicted: boolean;
}

// Function to calculate volatility
const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((sum, sd) => sum + sd, 0) / (returns.length - 1);
  
  return Math.sqrt(variance);
};

// Function to calculate moving average
const calculateMovingAverage = (prices: number[], period: number): number => {
  if (prices.length < period) return prices.reduce((a, b) => a + b, 0) / prices.length;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
};

// Improved prediction function
const generatePredictions = (
  historicalData: HistoricalDataPoint[],
  days: number
): PredictionDataPoint[] => {
  if (historicalData.length === 0) return [];
  
  const prices = historicalData.map(d => d.price);
  const lastPrice = prices[prices.length - 1];
  
  // Calculate key metrics
  const volatility = calculateVolatility(prices);
  const shortTermMA = calculateMovingAverage(prices, 7); // 7-day MA
  const longTermMA = calculateMovingAverage(prices, 30); // 30-day MA
  const overallTrend = (longTermMA - prices[0]) / prices[0]; // Overall trend over 90 days
  
  // Calculate average daily change
  let totalChange = 0;
  for (let i = 1; i < prices.length; i++) {
    totalChange += (prices[i] - prices[i-1]) / prices[i-1];
  }
  const avgDailyChange = totalChange / (prices.length - 1);
  
  // Generate predictions with more realistic fluctuations
  const predictions: PredictionDataPoint[] = [];
  let currentPrice = lastPrice;
  
  for (let i = 1; i <= days; i++) {
    // Base trend factor (dampened over time)
    const trendFactor = overallTrend * Math.exp(-i / 30); // Exponential decay
    
    // Moving average reversion factor
    const maReversion = (shortTermMA - currentPrice) / currentPrice * 0.1;
    
    // Volatility factor (random component)
    const randomFactor = (Math.random() - 0.5) * 2 * volatility;
    
    // Combine factors with weights
    const dailyChange = avgDailyChange * 0.3 + trendFactor * 0.4 + maReversion * 0.2 + randomFactor * 0.1;
    
    // Apply daily change with dampening over time
    const dampeningFactor = Math.exp(-i / 60); // Further dampen long-term predictions
    currentPrice = currentPrice * (1 + dailyChange * dampeningFactor);
    
    // Ensure price doesn't go negative
    currentPrice = Math.max(currentPrice, lastPrice * 0.1);
    
    const futureDate = new Date(historicalData[historicalData.length - 1].timestamp);
    futureDate.setDate(futureDate.getDate() + i);
    
    predictions.push({
      date<dyad-write path="src/components/CryptoDetail.tsx" description="Updating CryptoDetail with improved prediction algorithm">
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
  timestamp: number;
}

interface PredictionDataPoint {
  date: string;
  price: number;
  predicted: boolean;
}

// Function to calculate volatility
const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((sum, sd) => sum + sd, 0) / (returns.length - 1);
  
  return Math.sqrt(variance);
};

// Function to calculate moving average
const calculateMovingAverage = (prices: number[], period: number): number => {
  if (prices.length < period) return prices.reduce((a, b) => a + b, 0) / prices.length;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
};

// Improved prediction function
const generatePredictions = (
  historicalData: HistoricalDataPoint[],
  days: number
): PredictionDataPoint[] => {
  if (historicalData.length === 0) return [];
  
  const prices = historicalData.map(d => d.price);
  const lastPrice = prices[prices.length - 1];
  
  // Calculate key metrics
  const volatility = calculateVolatility(prices);
  const shortTermMA = calculateMovingAverage(prices, 7); // 7-day MA
  const longTermMA = calculateMovingAverage(prices, 30); // 30-day MA
  const overallTrend = (longTermMA - prices[Math.max(0, prices.length - 30)]) / prices[Math.max(0, prices.length - 30)];
  
  // Calculate average daily change
  let totalChange = 0;
  for (let i = 1; i < prices.length; i++) {
    totalChange += (prices[i] - prices[i-1]) / prices[i-1];
  }
  const avgDailyChange = totalChange / (prices.length - 1);
  
  // Generate predictions with more realistic fluctuations
  const predictions: PredictionDataPoint[] = [];
  let currentPrice = lastPrice;
  
  for (let i = 1; i <= days; i++) {
    // Base trend factor (dampened over time)
    const trendFactor = overallTrend * Math.exp(-i / 20); // Exponential decay
    
    // Moving average reversion factor
    const maReversion = (shortTermMA - currentPrice) / currentPrice * 0.05;
    
    // Volatility factor (random component)
    const randomFactor = (Math.random() - 0.5) * 2 * volatility * 0.5;
    
    // Combine factors with weights
    const dailyChange = avgDailyChange * 0.4 + trendFactor * 0.3 + maReversion * 0.2 + randomFactor * 0.1;
    
    // Apply daily change with dampening over time
    const dampeningFactor = Math.exp(-i / 40); // Further dampen long-term predictions
    currentPrice = currentPrice * (1 + dailyChange * dampeningFactor);
    
    // Ensure price doesn't go negative or drop too sharply
    currentPrice = Math.max(currentPrice, lastPrice * 0.3);
    
    const futureDate = new Date(historicalData[historicalData.length - 1].timestamp);
    futureDate.setDate(futureDate.getDate() + i);
    
    predictions.push({
      date: futureDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      price: currentPrice,
      predicted: true
    });
  }
  
  return predictions;
};

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
          potentialProfit: 0,
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
          price: item[1],
          timestamp: item[0]
        }));
        
        setHistoricalData(formattedHistoricalData);
        
        // Generate prediction data using improved algorithm
        const predictedData = generatePredictions(formattedHistoricalData, 30);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl">Carregando detalhes da criptomoeda...</p>
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

  const { recommendation, score } = analyzeCrypto(crypto);
  const isPositive = crypto.priceChange24h >= 0;

  // Generate recommendation reason based on analysis
  let recommendationReason = "";
  if (recommendation === "Comprar") {
    recommendationReason = "O preço está em tendência de alta nos últimos dias, com bom potencial de crescimento.";
  } else if (recommendation === "Vender") {
    recommendationReason = "O preço está em tendência de baixa e pode continuar caindo nos próximos dias.";
  } else {
    recommendationReason = "O preço está relativamente estável, sem tendência clara de alta ou baixa.";
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
                      tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
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
                Previsão baseada em médias móveis, volatilidade histórica e tendências de mercado. 
                O preço estimado em 30 dias é de <span className="font-bold">${predictionData[predictionData.length - 1]?.price.toFixed(2) || 'N/A'}</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CryptoDetail;