"use client";

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';

interface CryptoDetailProps {
  cryptos: Crypto[];
}

const CryptoDetail: React.FC<CryptoDetailProps> = ({ cryptos }) => {
  const { id } = useParams<{ id: string }>();
  const crypto = cryptos.find((c) => c.id === id);

  if (!crypto) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Criptomoeda não encontrada</h1>
        <Link to="/" className="text-blue-500 hover:text-blue-700">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{crypto.name} ({crypto.symbol})</h1>
      <p className="text-gray-600 mb-4">{crypto.details}</p>
      <p className="text-green-500 font-semibold">Potencial de Lucro: {crypto.potentialProfit}%</p>
      <Link to="/" className="text-blue-500 hover:text-blue-700">Voltar para a lista</Link>
    </div>
  );
};

export default CryptoDetail;