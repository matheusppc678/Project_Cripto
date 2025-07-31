"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';
import { analyzeCrypto } from '@/utils/cryptoAnalysis';
import { fetchCryptos } from '@/services/cryptoService';

const CryptoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crypto, setCrypto] = useState<Crypto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const cryptos = await fetchCryptos();
      const foundCrypto = cryptos.find((c) => c.id === id);
      setCrypto(foundCrypto || null);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Criptomoeda não encontrada</h1>
        <Link to="/" className="text-blue-500 hover:text-blue-700">Voltar para a lista</Link>
      </div>
    );
  }

  const { recommendation, score } = analyzeCrypto(crypto);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{crypto.name} ({crypto.symbol})</h1>
      <p className="text-gray-600 mb-4">{crypto.details}</p>
      <p className="text-green-500 font-semibold">Potencial de Lucro: {crypto.potentialProfit.toFixed(2)}%</p>
      <p className="text-blue-500">Recomendação: {recommendation}</p>
      <p className="text-gray-500">Pontuação: {score}</p>
      <Link to="/" className="text-blue-500 hover:text-blue-700">Voltar para a lista</Link>
    </div>
  );
};

export default CryptoDetail;