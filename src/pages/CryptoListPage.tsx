"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';
import { fetchCryptos } from '@/services/cryptoService';
import { analyzeCrypto } from '@/utils/cryptoAnalysis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CryptoListPage: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Update API URL to fetch 100 cryptos
        const originalUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';
        const response = await fetch(originalUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch crypto data');
        }
        
        const data = await response.json();
        
        const cryptoData = data.map((crypto: any) => ({
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          potentialProfit: calculatePotentialProfit(crypto.price_change_percentage_24h),
          details: `Current price: $${crypto.current_price.toFixed(2)} | Market cap: $${crypto.market_cap.toLocaleString()}`,
          currentPrice: crypto.current_price,
          priceChange24h: crypto.price_change_percentage_24h
        }));
        
        setCryptos(cryptoData);
        setFilteredCryptos(cryptoData);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...cryptos];
    
    // Apply recommendation filter
    if (filter !== 'all') {
      result = result.filter(crypto => {
        const { recommendation } = analyzeCrypto(crypto);
        if (filter === 'buy') return recommendation === 'Comprar';
        if (filter === 'sell') return recommendation === 'Vender';
        return true;
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(crypto => 
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.currentPrice - b.currentPrice;
      } else {
        return b.currentPrice - a.currentPrice;
      }
    });
    
    setFilteredCryptos(result);
  }, [cryptos, filter, sortOrder, searchTerm]);

  const calculatePotentialProfit = (priceChange24h: number): number => {
    return Math.min(Math.max(priceChange24h * 3, 1), 20);
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Top 100 Criptomoedas</h1>
        <Link to="/">
          <Button variant="outline">Voltar para Home</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar criptomoeda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: 'all' | 'buy' | 'sell') => setFilter(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="buy">Comprar</SelectItem>
              <SelectItem value="sell">Vender</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Preço {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Crypto Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Variação 24h</TableHead>
              <TableHead>Recomendação</TableHead>
              <TableHead>Pontuação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCryptos.map((crypto) => {
              const { recommendation, score } = analyzeCrypto(crypto);
              const isPositive = crypto.priceChange24h >= 0;
              
              return (
                <TableRow key={crypto.id}>
                  <TableCell className="font-medium">
                    <Link to={`/crypto/${crypto.id}`} className="hover:underline">
                      {crypto.name} ({crypto.symbol.toUpperCase()})
                    </Link>
                  </TableCell>
                  <TableCell>{formatPrice(crypto.currentPrice)}</TableCell>
                  <TableCell>
                    <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      {formatPercentage(crypto.priceChange24h)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={recommendation === 'Comprar' ? 'default' : recommendation === 'Vender' ? 'destructive' : 'secondary'}
                    >
                      {recommendation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {score}
                      <span className="ml-1 text-muted-foreground">/100</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredCryptos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma criptomoeda encontrada com os filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoListPage;