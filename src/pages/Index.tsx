"use client";

import React, { useEffect, useState } from 'react';
import CryptoList from '@/components/CryptoList';
import { Crypto } from '@/interfaces/Crypto';
import { fetchCryptos } from '@/services/cryptoService';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Top Criptomoedas</h1>
          <Link to="/list">
            <Button variant="outline">Ver Todas (100)</Button>
          </Link>
        </div>
        <CryptoList cryptos={cryptos} />
      </div>
    </div>
  );
};

export default Index;