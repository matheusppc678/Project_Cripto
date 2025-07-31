import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CryptoDetail from "@/components/CryptoDetail";
import CryptoListPage from "./pages/CryptoListPage";

const queryClient = new QueryClient();

// Get the basename from the environment variable set in vite.config.ts
// This will be '/your-repo-name/' in production on GitHub Pages, and '/' locally.
const basename = process.env.VITE_APP_BASENAME || '/';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/crypto/:id" element={<CryptoDetail />} />
          <Route path="/list" element={<CryptoListPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;