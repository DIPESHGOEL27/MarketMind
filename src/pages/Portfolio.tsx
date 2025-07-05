import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Star, 
  Edit3,
  Trash2,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useMarketData } from '../contexts/MarketDataContext';
import { useSentiment } from '../contexts/SentimentContext';

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  targetPrice?: number;
  stopLoss?: number;
  notes?: string;
}

const Portfolio: React.FC = () => {
  const { stockData, getStockData, watchlist, addToWatchlist, removeFromWatchlist } = useMarketData();
  const { insights, getRelevantInsights } = useSentiment();
  
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    shares: 0,
    purchasePrice: 0,
    targetPrice: 0,
    stopLoss: 0,
    notes: ''
  });

  useEffect(() => {
    // Load portfolio from localStorage
    const savedPortfolio = localStorage.getItem('marketmind-portfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  useEffect(() => {
    // Save portfolio to localStorage whenever it changes
    localStorage.setItem('marketmind-portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const handleAddPosition = async () => {
    if (!newPosition.symbol || newPosition.shares <= 0 || newPosition.purchasePrice <= 0) {
      return;
    }

    // Get current stock data
    const stockInfo = await getStockData(newPosition.symbol.toUpperCase());
    if (!stockInfo) {
      return;
    }

    const position: PortfolioItem = {
      id: Date.now().toString(),
      symbol: newPosition.symbol.toUpperCase(),
      name: stockInfo.name,
      shares: newPosition.shares,
      purchasePrice: newPosition.purchasePrice,
      currentPrice: stockInfo.price,
      purchaseDate: new Date().toISOString(),
      targetPrice: newPosition.targetPrice || undefined,
      stopLoss: newPosition.stopLoss || undefined,
      notes: newPosition.notes || undefined
    };

    setPortfolio(prev => [...prev, position]);
    setNewPosition({
      symbol: '',
      shares: 0,
      purchasePrice: 0,
      targetPrice: 0,
      stopLoss: 0,
      notes: ''
    });
    setShowAddModal(false);

    // Add to watchlist if not already there
    if (!watchlist.some(item => item.symbol === position.symbol)) {
      addToWatchlist(position.symbol, position.targetPrice);
    }
  };

  const handleDeletePosition = (id: string) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdatePosition = (updatedPosition: PortfolioItem) => {
    setPortfolio(prev => prev.map(item => 
      item.id === updatedPosition.id ? updatedPosition : item
    ));
    setEditingItem(null);
  };

  const calculatePortfolioStats = () => {
    const totalValue = portfolio.reduce((sum, item) => sum + (item.currentPrice * item.shares), 0);
    const totalCost = portfolio.reduce((sum, item) => sum + (item.purchasePrice * item.shares), 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    const winners = portfolio.filter(item => item.currentPrice > item.purchasePrice).length;
    const losers = portfolio.filter(item => item.currentPrice < item.purchasePrice).length;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      winners,
      losers,
      totalPositions: portfolio.length
    };
  };

  const getPositionStatus = (item: PortfolioItem) => {
    const gainLoss = (item.currentPrice - item.purchasePrice) * item.shares;
    const gainLossPercent = ((item.currentPrice - item.purchasePrice) / item.purchasePrice) * 100;
    
    let status = 'neutral';
    if (item.targetPrice && item.currentPrice >= item.targetPrice) {
      status = 'target-reached';
    } else if (item.stopLoss && item.currentPrice <= item.stopLoss) {
      status = 'stop-loss';
    } else if (gainLoss > 0) {
      status = 'profit';
    } else if (gainLoss < 0) {
      status = 'loss';
    }

    return { gainLoss, gainLossPercent, status };
  };

  const stats = calculatePortfolioStats();
  const portfolioSymbols = portfolio.map(item => item.symbol);
  const relevantInsights = getRelevantInsights(portfolioSymbols);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">${stats.totalValue.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Total Value</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${
              stats.totalGainLoss >= 0 ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
            }`}>
              {stats.totalGainLoss >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                stats.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.totalGainLoss >= 0 ? '+' : ''}${stats.totalGainLoss.toFixed(2)}
              </p>
              <p className="text-gray-400 text-sm">Total P&L</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                stats.totalGainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.totalGainLossPercent >= 0 ? '+' : ''}{stats.totalGainLossPercent.toFixed(2)}%
              </p>
              <p className="text-gray-400 text-sm">Total Return</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
              <Target className="h-6 w-6 text-orange-400" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{stats.totalPositions}</p>
              <p className="text-gray-400 text-sm">{stats.winners}W / {stats.losers}L</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Positions</h2>
            
            {portfolio.length === 0 ? (
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No positions yet</h3>
                <p className="text-gray-500 mb-4">Add your first position to start tracking your portfolio</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Position
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolio.map((item) => {
                  const { gainLoss, gainLossPercent, status } = getPositionStatus(item);
                  
                  return (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{item.symbol}</span>
                              {status === 'target-reached' && <CheckCircle className="h-4 w-4 text-green-400" />}
                              {status === 'stop-loss' && <AlertCircle className="h-4 w-4 text-red-400" />}
                            </div>
                            <div className="text-sm text-gray-400">{item.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePosition(item.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-gray-400 text-xs">Shares</p>
                          <p className="text-white font-semibold">{item.shares}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Avg Cost</p>
                          <p className="text-white font-semibold">${item.purchasePrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Current</p>
                          <p className="text-white font-semibold">${item.currentPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Value</p>
                          <p className="text-white font-semibold">${(item.currentPrice * item.shares).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`text-sm font-semibold ${
                            gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                          </div>
                          {item.targetPrice && (
                            <div className="text-xs text-gray-400">
                              Target: ${item.targetPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Insights Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Portfolio Insights</h3>
            
            <div className="space-y-3">
              {relevantInsights.length > 0 ? (
                relevantInsights.slice(0, 5).map((insight) => (
                  <div key={insight.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start space-x-2 mb-2">
                      {insight.type === 'opportunity' && <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />}
                      {insight.type === 'risk' && <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />}
                      {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{insight.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            {insight.relevantSymbols.filter(symbol => portfolioSymbols.includes(symbol)).map(symbol => (
                              <span key={symbol} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                {symbol}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{Math.round(insight.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Activity className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No insights available</p>
                  <p className="text-gray-500 text-xs">Add positions to see AI insights</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Add New Position</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Symbol</label>
                <input
                  type="text"
                  value={newPosition.symbol}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AAPL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Shares</label>
                <input
                  type="number"
                  value={newPosition.shares}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, shares: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPosition.purchasePrice}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="150.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPosition.targetPrice}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="200.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Stop Loss (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPosition.stopLoss}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="130.00"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPosition}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
