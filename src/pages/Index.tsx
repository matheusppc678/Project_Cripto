"use client";

import React, { useEffect, useState } from 'react';
import CryptoList from '@/components/CryptoList';
import { fetchTop10Cryptos } from '@/services/cryptoService';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTop10Cryptos();
      setCryptos(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-4">
          <Link to="/top-100">
            <Button variant="outline">Ver Top 100 Criptomoedas</Button>
          </Link>
        </div>
        <CryptoList cryptos={cryptos} />
      </div>
    </div>
  );
};

export default Index;