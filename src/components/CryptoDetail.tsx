"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';
import { getRecommendationAndScore, generateRealisticPredictions, calculateMovingAverage } from '@/utils/cryptoAnalysis'; // Importa as funções centralizadas
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
import { fetchTopCryptos, fetchHistoricalData } from '@/services/cryptoService';

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
  const { id } = useParams<{ id: string }>(); // id será o slug (ex: "bitcoin")
  const navigate = useNavigate();
  const [crypto, setCrypto] = useState<Crypto | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<(HistoricalDataPoint | PredictionDataPoint)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Passo 1: Buscar as top criptomoedas para encontrar o símbolo com base no slug ID
        const topCryptos = await fetchTopCryptos(100); // Busca o suficiente para encontrar a cripto
        const foundCrypto = topCryptos.find(c => c.id === id);

        if (!foundCrypto) {
          setCrypto(null); // Cripto não encontrada
          setLoading(false);
          return;
        }

        setCrypto(foundCrypto); // Define as informações básicas da cripto

        // Passo 2: Buscar dados históricos usando o símbolo encontrado
        const formattedHistoricalData = await fetchHistoricalData(foundCrypto.symbol, 90);
        setHistoricalData(formattedHistoricalData);

        // Passo 3: Gerar previsões usando a função centralizada
        const predictedData = generateRealisticPredictionsWithSmoothing(formattedHistoricalData);
        setPredictionData(predictedData);

        // Passo 4: Combinar dados históricos e de previsão para o gráfico
        const combinedData = [
          ...formattedHistoricalData,
          ...predictedData
        ];
        setChartData(combinedData);

      } catch (error) {
        console.error('Error fetching crypto data for detail page:', error);
        setCrypto(null); // Indica erro ou não encontrado
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const generateRealisticPredictionsWithSmoothing = (historicalData: HistoricalDataPoint[]): PredictionDataPoint[] => {
    if (historicalData.length === 0) return [];
  
    const smoothingPeriod = 7; // Use the last 7 days for smoothing
    const lastRealPrice = historicalData[historicalData.length - 1].price;
  
    // Calculate moving average for the last 'smoothingPeriod' days
    const lastPrices = historicalData.slice(-smoothingPeriod).map(item => item.price);
    const initialPredictionBase = lastPrices.reduce((sum, price) => sum + price, 0) / lastPrices.length;
  
    const predictedData: PredictionDataPoint[] = [];
  
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const date = futureDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
  
      // For the first prediction point, use a blend of the last real price and the initial prediction base
      let predictedPrice: number;
      if (i === 1) {
        predictedPrice = (0.5 * lastRealPrice) + (0.5 * initialPredictionBase); // 50% blend
      } else {
        // After the first point, use the standard prediction logic
        const volatility = 0.05; // Adjust as needed
        const fluctuation = (Math.random() - 0.5) * 2 * volatility * initialPredictionBase;
        predictedPrice = initialPredictionBase + fluctuation;
      }
  
      predictedPrice = Math.max(0.000001, predictedPrice); // Ensure price is not negative
  
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

  const lastPredictedPrice = predictionData.length > 0 ? predictionData[predictionData.length - 1].price : undefined;
  const { recommendation, score } = getRecommendationAndScore({ // Usa a função centralizada
    currentPrice: crypto.currentPrice,
    predictedPrice: lastPredictedPrice,
  });
  const isPositive = (crypto.priceChange24h || 0) >= 0;

  // Gera o motivo da recomendação com base na análise
  let recommendationReason = "";
  if (recommendation === "Comprar") {
    recommendationReason = "Com base na previsão de 30 dias, o preço tem um bom potencial de valorização.";
  } else if (recommendation === "Vender") {
    recommendationReason = "Com base na previsão de 30 dias, o preço pode ter uma desvalorização significativa.";
  } else {
    recommendationReason = "A previsão de 30 dias indica que o preço deve permanecer relativamente estável.";
  }

  const formatPrice = (price?: number) => {
    if (price === undefined) return 'N/A';
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage?: number) => {
    if (percentage === undefined) return 'N/A';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

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
                  <p className="text-3xl font-bold">{formatPrice(crypto.currentPrice)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Variação 24h</h3>
                  <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-5 w-5 mr-2" /> : <TrendingDown className="h-5 w-5 mr-2" />}
                    <span className="text-2xl font-bold">
                      {formatPercentage(crypto.priceChange24h)}
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
                  <p className="font-semibold">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Previsão baseada na tendência dos últimos 30 dias. O preço estimado em 30 dias é de <span className="font-bold">{formatPrice(predictionData[predictionData.length - 1]?.price)}</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CryptoDetail;