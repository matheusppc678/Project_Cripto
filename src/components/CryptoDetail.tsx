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
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

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
        
        // Generate prediction data for next 30 days
        const lastPrice = formattedHistoricalData[formattedHistoricalData.length - 1].price;
        const priceChangePercentage = data.market_data.price_change_percentage_30d || 0;
        const predictedData: PredictionDataPoint[] = [];
        
        // Generate 30 days of predictions
        for (let i = 1; i <= 30; i++) {
          // Simple linear projection based on 30-day change
          const predictedPrice = lastPrice * (1 + (priceChangePercentage / 30) * i / 100);
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);
          
          predictedData.push({
            date: futureDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
            price: predictedPrice,
            predicted: true
          });
        }
        
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
      <div className="container mx-auto p-4">
        <p>Carregando detalhes da criptomoeda...</p>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Criptomoeda não encontrada</h1>
        <Button onClick={() => navigate(-1)} variant="outline">
          Voltar
        </Button>
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
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button onClick={() => navigate(-1)} variant="outline" className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">{crypto.name} ({crypto.symbol.toUpperCase()})</h1>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval={Math.floor(chartData.length / 10)}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Preço']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Histórico"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#82ca9d"
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
                <h3 className="text-lg font-semibold">Preço Atual</h3>
                <p className="text-2xl font-bold">${crypto.currentPrice.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Variação 24h</h3>
                <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                  <span className="text-xl font-semibold">
                    {crypto.priceChange24h >= 0 ? '+' : ''}{crypto.priceChange24h?.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Recomendação</h3>
                <Badge 
                  variant={recommendation === 'Comprar' ? 'default' : recommendation === 'Vender' ? 'destructive' : 'secondary'}
                  className="text-lg py-2 px-4"
                >
                  {recommendation}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Pontuação de Atratividade</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">{score}</span>
                  <span className="text-muted-foreground ml-1">/100</span>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {predictionData.slice(0, 15).map((item, index) => (
              <div key={index} className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">{item.date}</p>
                <p className="font-semibold">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              Previsão baseada na tendência dos últimos 30 dias. O preço estimado em 30 dias é de <span className="font-bold">${predictionData[predictionData.length - 1]?.price.toFixed(2) || 'N/A'}</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoDetail;