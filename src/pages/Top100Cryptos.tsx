"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';
import { fetchTop100Cryptos } from '@/services/cryptoService';
import { analyzeCrypto } from '@/utils/cryptoAnalysis';
import { Button } from '@/components/ui/button';

const Top100Cryptos: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Crypto[]>([]);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTop100Cryptos();
      setCryptos(data);
      setFilteredCryptos(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...cryptos];
    
    // Apply filter
    if (filter === 'buy') {
      result = result.filter(crypto => {
        const { recommendation } = analyzeCrypto(crypto);
        return recommendation === 'Comprar';
      });
    } else if (filter === 'sell') {
      result = result.filter(crypto => {
        const { recommendation } = analyzeCrypto(crypto);
        return recommendation === 'Vender';
      });
    }

    // Apply sort
    result.sort((a, b) => {
      return sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
    });

    setFilteredCryptos(result);
  }, [cryptos, filter, sortOrder]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Top 100 Criptomoedas</h1>
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          <Button variant="outline">Ver Top 10</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button 
          variant={filter === 'buy' ? 'default' : 'outline'} 
          onClick={() => setFilter('buy')}
        >
          Comprar
        </Button>
        <Button 
          variant={filter === 'sell' ? 'default' : 'outline'} 
          onClick={() => setFilter('sell')}
        >
          Vender
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
        >
          Ordenar por Preço: {sortOrder === 'desc' ? 'Maior → Menor' : 'Menor → Maior'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-right">Preço (USD)</th>
              <th className="px-4 py-2 text-right">Variação 24h</th>
              <th className="px-4 py-2 text-center">Recomendação</th>
              <th className="px-4 py-2 text-right">Pontuação</th>
            </tr>
          </thead>
          <tbody>
            {filteredCryptos.map((crypto) => {
              const { recommendation, score } = analyzeCrypto(crypto);
              const priceChangeColor = crypto.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';
              const recommendationColor = recommendation === 'Comprar' ? 'text-green-500' : 
                                        recommendation === 'Vender' ? 'text-red-500' : 'text-yellow-500';
              
              return (
                <tr key={crypto.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link to={`/crypto/${crypto.id}`} className="hover:text-blue-500">
                      {crypto.name} ({crypto.symbol.toUpperCase()})
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right">${crypto.price.toFixed(2)}</td>
                  <td className={`px-4 py-2 text-right ${priceChangeColor}`}>
                    {crypto.priceChange24h?.toFixed(2)}%
                  </td>
                  <td className={`px-4 py-2 text-center ${recommendationColor}`}>
                    {recommendation}
                  </td>
                  <td className="px-4 py-2 text-right">{score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Top100Cryptos;