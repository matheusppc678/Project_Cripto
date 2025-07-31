"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';

interface CryptoListProps {
  cryptos: Crypto[];
}

const CryptoList: React.FC<CryptoListProps> = ({ cryptos }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Top 10 Criptomoedas com Maior Potencial de Lucro</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cryptos.map((crypto) => (
          <li key={crypto.id} className="bg-white shadow rounded-lg p-4">
            <Link to={`/crypto/${crypto.id}`} className="block hover:bg-gray-100 transition-colors duration-200">
              <h2 className="text-lg font-semibold">{crypto.name} ({crypto.symbol})</h2>
              <p className="text-gray-600">Potencial de Lucro: {crypto.potentialProfit}%</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CryptoList;