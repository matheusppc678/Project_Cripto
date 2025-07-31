import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CryptoDetail from "@/components/CryptoDetail";
import { Crypto } from "@/interfaces/Crypto";

const queryClient = new QueryClient();

const mockCryptos: Crypto[] = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', potentialProfit: 15.5, details: 'Bitcoin is the first cryptocurrency...' },
  { id: '2', name: 'Ethereum', symbol: 'ETH', potentialProfit: 12.3, details: 'Ethereum is a decentralized platform...' },
  { id: '3', name: 'Ripple', symbol: 'XRP', potentialProfit: 10.1, details: 'Ripple is a payment protocol...' },
  { id: '4', name: 'Litecoin', symbol: 'LTC', potentialProfit: 9.8, details: 'Litecoin is a peer-to-peer cryptocurrency...' },
  { id: '5', name: 'Cardano', symbol: 'ADA', potentialProfit: 8.7, details: 'Cardano is a blockchain platform...' },
  { id: '6', name: 'Polkadot', symbol: 'DOT', potentialProfit: 7.6, details: 'Polkadot is a multichain network...' },
  { id: '7', name: 'Solana', symbol: 'SOL', potentialProfit: 6.5, details: 'Solana is a high-performance blockchain...' },
  { id: '8', name: 'Dogecoin', symbol: 'DOGE', potentialProfit: 5.4, details: 'Dogecoin is a meme-inspired cryptocurrency...' },
  { id: '9', name: 'Shiba Inu', symbol: 'SHIB', potentialProfit: 4.3, details: 'Shiba Inu is an Ethereum-based token...' },
  { id: '10', name: 'Tron', symbol: 'TRX', potentialProfit: 3.2, details: 'Tron is a blockchain-based operating system...' },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/crypto/:id" element={<CryptoDetail cryptos={mockCryptos} />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;