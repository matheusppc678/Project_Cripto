"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crypto } from '@/interfaces/Crypto';
import { fetchTopCryptos } from '@/services/cryptoService';
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
import { ArrowUpDown, TrendingUp, TrendingDown, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        // Busca as top 100 criptomoedas para a página de listagem
        const data = await fetchTopCryptos(100);
        setCryptos(data);
        setFilteredCryptos(data); // Inicializa a lista filtrada com todas as criptomoedas
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
    
    // Aplica filtro de recomendação
    if (filter !== 'all') {
      result = result.filter(crypto => {
        const { recommendation } = analyzeCrypto({
          currentPrice: crypto.currentPrice,
          priceChange24h: crypto.priceChange24h
        });
        if (filter === 'buy') return recommendation === 'Comprar';
        if (filter === 'sell') return recommendation === 'Vender';
        return true;
      });
    }
    
    // Aplica filtro de busca
    if (searchTerm) {
      result = result.filter(crypto => 
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplica ordenação
    result.sort((a, b) => {
      // Lida com currentPrice potencialmente indefinido
      const priceA = a.currentPrice ?? 0;
      const priceB = b.currentPrice ?? 0;

      if (sortOrder === 'asc') {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
    
    setFilteredCryptos(result);
  }, [cryptos, filter, sortOrder, searchTerm]);

  const formatPrice = (price?: number) => { // Torna o preço opcional
    if (price === undefined) return 'N/A';
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage?: number) => { // Torna a porcentagem opcional
    if (percentage === undefined) return 'N/A';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl">Carregando dados das criptomoedas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Top 100 Criptomoedas</h1>
            <p className="text-muted-foreground">Análise completa das principais criptomoedas do mercado</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Voltar para Home
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar criptomoeda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
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
                  className="flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Preço {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crypto Table */}
        <Card>
          <CardContent className="p-0">
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
                  const { recommendation, score } = analyzeCrypto({
                    currentPrice: crypto.currentPrice,
                    priceChange24h: crypto.priceChange24h
                  });
                  const isPositive = (crypto.priceChange24h || 0) >= 0;
                  
                  return (
                    <TableRow key={crypto.id} className="hover:bg-secondary/50">
                      <TableCell className="font-medium">
                        <Link to={`/crypto/${crypto.id}`} className="hover:underline hover:text-primary transition-colors">
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
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma criptomoeda encontrada com os filtros aplicados.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CryptoListPage;