"use client";

import React, { useEffect, useState } from 'react';
import CryptoList from '@/components/CryptoList';
import { Crypto } from '@/interfaces/Crypto';
import { fetchCryptos } from '@/services/cryptoService';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const Index: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCryptos();
      setCryptos(data);
    };

    // Fetch immediately
    fetchData();

    // Then every 30 minutes
    const interval = setInterval(fetchData, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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