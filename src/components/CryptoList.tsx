"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';
import { analyzeCrypto } from '@/utils/cryptoAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoListProps {
  cryptos: Crypto[];
}

const CryptoList: React.FC<CryptoListProps> = ({ cryptos }) => {
  const formatPrice = (price?: number) => {
    if (price === undefined) return 'N/A';
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage?: number) => {
    if (percentage === undefined) return 'N/A';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cryptos.map((crypto) => {
        const { recommendation, score } = analyzeCrypto({
          currentPrice: crypto.currentPrice,
          priceChange24h: crypto.priceChange24h
        });
        const isPositive = (crypto.priceChange24h || 0) >= 0;
        
        return (
          <Card key={crypto.id} className="overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg truncate">{crypto.name}</span>
                <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                  {crypto.symbol.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Preço Atual</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(crypto.currentPrice)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Variação 24h</p>
                  <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="font-semibold">
                      {formatPercentage(crypto.priceChange24h)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Recomendação</p>
                    <Badge 
                      variant={recommendation === 'Comprar' ? 'default' : recommendation === 'Vender' ? 'destructive' : 'secondary'}
                      className="mt-1"
                    >
                      {recommendation}
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Pontuação</p>
                    <p className="text-lg font-bold">{score}<span className="text-muted-foreground text-sm">/100</span></p>
                  </div>
                </div>
                
                <Link to={`/crypto/${crypto.id}`} className="block mt-4">
                  <div className="w-full py-2 text-center text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Ver Detalhes
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CryptoList;