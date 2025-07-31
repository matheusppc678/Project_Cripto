"use client";

import React, { useEffect, useState } from 'react';
import CryptoList from '@/components/CryptoList';
import { Crypto } from '@/interfaces/Crypto';
import { fetchCryptos } from '@/services/cryptoService';

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
      <CryptoList cryptos={cryptos} />
    </div>
  );
};

export default Index;