import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

type CryptoData = {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  avg90Days: number;
  forecast30Days: number;
  recommendation: 'COMPRAR' | 'VENDER' | 'MANTER';
  color: string;
  icon: string;
};

export default function App() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const chartRef = useRef<Chart | null>(null);

  const cryptoData: CryptoData[] = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', currentPrice: 61200, avg90Days: 67800, forecast30Days: 68500, recommendation: 'COMPRAR', color: '#f7931a', icon: '🟠' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', currentPrice: 3350, avg90Days: 3200, forecast30Days: 3400, recommendation: 'MANTER', color: '#627eea', icon: '🔷' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', currentPrice: 185, avg90Days: 142, forecast30Days: 160, recommendation: 'VENDER', color: '#00ffa3', icon: '💚' },
    { id: 'bnb', name: 'BNB', symbol: 'BNB', currentPrice: 580, avg90Days: 550, forecast30Days: 620, recommendation: 'COMPRAR', color: '#f3ba2f', icon: '🟡' },
    { id: 'xrp', name: 'XRP', symbol: 'XRP', currentPrice: 0.52, avg90Days: 0.68, forecast30Days: 0.60, recommendation: 'COMPRAR', color: '#27a2db', icon: '🔵' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', currentPrice: 0.44, avg90Days: 0.59, forecast30Days: 0.55, recommendation: 'COMPRAR', color: '#0033ad', icon: '🔷' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', currentPrice: 0.16, avg90Days: 0.12, forecast30Days: 0.14, recommendation: 'VENDER', color: '#cb9800', icon: '🐕' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', currentPrice: 6.80, avg90Days: 7.50, forecast30Days: 7.20, recommendation: 'MANTER', color: '#e6007a', icon: '🟣' },
    { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', currentPrice: 35, avg90Days: 32, forecast30Days: 38, recommendation: 'MANTER', color: '#e84142', icon: '🔴' },
    { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', currentPrice: 18, avg90Days: 16, forecast30Days: 20, recommendation: 'MANTER', color: '#2a5ada', icon: '🔗' },
  ];

  useEffect(() => {
    if (selectedCrypto && chartRef.current) {
      chartRef.current.destroy();
    }

    if (selectedCrypto) {
      const ctx = document.getElementById('priceChart') as HTMLCanvasElement;
      
      // Generate historical and forecast data
      const labels = [];
      const historicalData = [];
      const forecastData = [];
      
      // Historical data (15 days)
      for (let i = 15; i > 0; i--) {
        labels.push(`D-${i}`);
        const basePrice = selectedCrypto.avg90Days;
        const randomFactor = 0.95 + Math.random() * 0.1;
        historicalData.push((basePrice * randomFactor).toFixed(2));
      }
      
      // Current day
      labels.push('Hoje');
      historicalData.push(selectedCrypto.currentPrice);
      
      // Forecast data (14 days)
      for (let i = 1; i <= 14; i++) {
        labels.push(`D+${i}`);
        const progress = i / 14;
        const forecastPrice = selectedCrypto.currentPrice + 
          (selectedCrypto.forecast30Days - selectedCrypto.currentPrice) * progress;
        const randomFactor = 0.98 + Math.random() * 0.04;
        forecastData.push((forecastPrice * randomFactor).toFixed(2));
      }

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Histórico de Preços',
              data: historicalData,
              borderColor: selectedCrypto.color,
              backgroundColor: 'transparent',
              borderWidth: 2,
              tension: 0.1
            },
            {
              label: 'Previsão 30 Dias',
              data: [historicalData[historicalData.length - 1], ...forecastData],
              borderColor: selectedCrypto.color,
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.1
            },
            {
              label: 'Média 90 Dias',
              data: Array(labels.length).fill(selectedCrypto.avg90Days),
              borderColor: '#9ca3af',
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderDash: [2, 2]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    }
  }, [selectedCrypto]);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'COMPRAR': return 'bg-green-100 text-green-800';
      case 'VENDER': return 'bg-red-100 text-red-800';
      case 'MANTER': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">CryptoAnalyst Pro</h1>
        <p className="text-gray-600">Análise técnica em tempo real</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {cryptoData.map((crypto) => {
          const priceChange = ((crypto.currentPrice - crypto.avg90Days) / crypto.avg90Days * 100).toFixed(2);
          const isPositive = parseFloat(priceChange) >= 0;
          
          return (
            <div
              key={crypto.id}
              onClick={() => openModal(crypto)}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all cursor-pointer hover:shadow-lg"
              style={{ borderLeft: `4px solid ${crypto.color}` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{crypto.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{crypto.name}</h3>
                  <p className="text-gray-500">{crypto.symbol}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-2xl font-bold">${crypto.currentPrice.toLocaleString()}</p>
                <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '↑' : '↓'} {Math.abs(parseFloat(priceChange))}% vs 90d
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Best Opportunity Banner */}
      <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">🔥 Oportunidade do Dia</h3>
            <p className="mt-2">
              {cryptoData[0].name} ({cryptoData[0].symbol}) com potencial de 
              {((cryptoData[0].forecast30Days - cryptoData[0].currentPrice) / cryptoData[0].currentPrice * 100).toFixed(2)}% em 30 dias
            </p>
          </div>
          <button 
            onClick={() => openModal(cryptoData[0])}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Ver Detalhes
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedCrypto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <span 
                      className="w-8 h-8 rounded-full inline-block flex items-center justify-center"
                      style={{ backgroundColor: selectedCrypto.color }}
                    >
                      {selectedCrypto.icon}
                    </span>
                    {selectedCrypto.name} ({selectedCrypto.symbol})
                  </h2>
                  <p className="text-gray-500">Análise técnica detalhada</p>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Preço Atual</p>
                  <p className="text-2xl font-bold">${selectedCrypto.currentPrice.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Média 90 Dias</p>
                  <p className="text-2xl font-bold">${selectedCrypto.avg90Days.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Previsão 30 Dias</p>
                  <p className="text-2xl font-bold">
                    ${selectedCrypto.forecast30Days.toLocaleString()} (
                    {((selectedCrypto.forecast30Days - selectedCrypto.currentPrice) / selectedCrypto.currentPrice * 100).toFixed(2)}%)
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Histórico de Preços</h3>
                <div className="h-64">
                  <canvas id="priceChart"></canvas>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Recomendação</h3>
                  <div className={`p-4 rounded-xl text-center ${getRecommendationColor(selectedCrypto.recommendation)}`}>
                    <p className="text-sm font-semibold mb-1">RECOMENDAÇÃO</p>
                    <p className="text-3xl font-bold">{selectedCrypto.recommendation}</p>
                    <p className="text-sm mt-2">
                      Potencial: {((selectedCrypto.forecast30Days - selectedCrypto.currentPrice) / selectedCrypto.currentPrice * 100).toFixed(2)}% em 30 dias
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Análise Técnica</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">
                    {selectedCrypto.recommendation === 'COMPRAR' && 
                      `Oportunidade de compra! O preço está ${Math.abs(((selectedCrypto.currentPrice - selectedCrypto.avg90Days) / selectedCrypto.avg90Days * 100).toFixed(2))}% abaixo da média histórica e a previsão indica alta de ${((selectedCrypto.forecast30Days - selectedCrypto.currentPrice) / selectedCrypto.currentPrice * 100).toFixed(2)}% nos próximos 30 dias.`}
                    {selectedCrypto.recommendation === 'VENDER' && 
                      `Recomendação de venda. O preço está ${((selectedCrypto.currentPrice - selectedCrypto.avg90Days) / selectedCrypto.avg90Days * 100).toFixed(2)}% acima da média histórica e a previsão indica queda de ${Math.abs(((selectedCrypto.forecast30Days - selectedCrypto.currentPrice) / selectedCrypto.currentPrice * 100).toFixed(2))}% nos próximos 30 dias.`}
                    {selectedCrypto.recommendation === 'MANTER' && 
                      `O preço está próximo da média histórica (${((selectedCrypto.currentPrice - selectedCrypto.avg90Days) / selectedCrypto.avg90Days * 100).toFixed(2)}%) com previsão de ${((selectedCrypto.forecast30Days - selectedCrypto.currentPrice) / selectedCrypto.currentPrice * 100) >= 0 ? 'alta' : 'queda'} de ${Math.abs(((selectedCrypto.forecast30Days - selectedCrypto.currentPrice) / selectedCrypto.currentPrice * 100).toFixed(2))}% nos próximos 30 dias. Mantenha sua posição.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}