"use client";

import React, { useEffect, useState } from 'react';
import CryptoList from '@/components/CryptoList';
import { Crypto } from '@/interfaces/Crypto';
import { fetchCryptosWithPredictions } from '@/services/cryptoService'; // Changed import
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const Index: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading true before fetch
      const data = await fetchCryptosWithPredictions(10); // Fetch top 10 with predictions
      setCryptos(data);
      setLoading(false); // Set loading false after fetch
    };

    // Fetch immediately
    fetchData();

    // Then every 30 minutes (consider if this is too frequent with many API calls)
    const interval = setInterval(fetchData, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Carregando dados das criptomoedas com previsões (isso pode levar um tempo)...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Crypto Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Analise as principais criptomoedas com recomendações baseadas em dados de mercado
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Link to="/list">
            <Button size="lg" className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
              Ver Todas as Criptomoedas (100)
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <CryptoList cryptos={cryptos} />
        </div>
      </div>
    </div>
  );
};

export default Index;