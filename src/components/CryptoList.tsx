"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';
import { analyzeCrypto } from '@/utils/cryptoAnalysis';

interface CryptoListProps {
  cryptos: Crypto[];
}

const CryptoList: React.FC<CryptoListProps> = ({ cryptos }) => {
  return (
    <div className="container mx-auto p-4">
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cryptos.map((crypto) => {
          const { recommendation, score } = analyzeCrypto(crypto);
          return (
            <li key={crypto.id} className="bg-white shadow rounded-lg p-4">
              <Link to={`/crypto/${crypto.id}`} className="block hover:bg-gray-100 transition-colors duration-200">
                <h2 className="text-lg font-semibold">{crypto.name} ({crypto.symbol.toUpperCase()})</h2>
                <p className="text-gray-600">Potencial de Lucro: {crypto.potentialProfit.toFixed(2)}%</p>
                <p className="text-blue-500">Recomendação: {recommendation}</p>
                <p className="text-gray-500">Pontuação: {score}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CryptoList;