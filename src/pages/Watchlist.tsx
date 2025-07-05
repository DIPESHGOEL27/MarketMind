import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Star, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Bell, 
  Target,
  Edit3,
  Activity,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useMarketData } from '../contexts/MarketDataContext';
import { useSentiment } from '../contexts/SentimentContext';

const Watchlist: React.FC = () => {
  const { 
    watchlist, 
    addToWatchlist, 
    removeFromWatchlist, 
    getStockData, 
    stockData,
    searchStocks 
  } = useMarketData();
  
  const { insights, getRelevantInsights } = useSentiment();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    targetPrice: 0,
    notes: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWatchItem, setNewWatchItem] = useState({
    symbol: '',
    targetPrice: 0,
    notes: ''
  });

  useEffect(() => {
    // Get current data for watchlist items
    watchlist.forEach(async (item) => {
      if (!stockData[item.symbol]) {
        await getStockData(item.symbol);
      }
    });
  }, [watchlist, stockData, getStockData]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      const results = await searchStocks(query);
      setSearchResults(results.filter(stock => 
        !watchlist.some(item => item.symbol === stock.symbol)
      ));
    } else {
      setSearchResults([]);
    }
  };

  const handleAddToWatchlist = (stock?: any) => {
    if (stock) {
      addToWatchlist(stock.symbol);
      setSearchQuery('');
      setSearchResults([]);
    } else if (newWatchItem.symbol) {
      addToWatchlist(newWatchItem.symbol, newWatchItem.targetPrice, newWatchItem.notes);
      setNewWatchItem({ symbol: '', targetPrice: 0, notes: '' });
      setShowAddModal(false);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    removeFromWatchlist(symbol);
  };

  const handleEditWatchlistItem = (symbol: string) => {
    const item = watchlist.find(w => w.symbol === symbol);
    if (item) {
      setEditValues({
        targetPrice: item.targetPrice || 0,
        notes: item.notes || ''
      });
      setEditingSymbol(symbol);
    }
  };

  const handleSaveEdit = () => {
    if (editingSymbol) {
      // Remove old item and add updated one
      removeFromWatchlist(editingSymbol);
      addToWatchlist(editingSymbol, editValues.targetPrice, editValues.notes);
      setEditingSymbol(null);
    }
  };

  const getWatchlistItemStatus = (symbol: string) => {
    const stock = stockData[symbol];
    const watchItem = watchlist.find(item => item.symbol === symbol);
    
    if (!stock || !watchItem) return null;

    let status = 'neutral';
    let message = '';

    if (watchItem.targetPrice) {
      if (stock.price >= watchItem.targetPrice) {
        status = 'target-reached';
        message = `Target price of $${watchItem.targetPrice} reached!`;
      } else if (stock.price >= watchItem.targetPrice * 0.95) {
        status = 'near-target';
        message = `Near target price ($${watchItem.targetPrice})`;
      }
    }

    if (stock.changePercent >= 5) {
      status = 'strong-gain';
      message = `Strong gain today (+${stock.changePercent.toFixed(2)}%)`;
    } else if (stock.changePercent <= -5) {
      status = 'strong-loss';
      message = `Significant drop today (${stock.changePercent.toFixed(2)}%)`;
    }

    return { status, message };
  };

  const watchlistSymbols = watchlist.map(item => item.symbol);
  const relevantInsights = getRelevantInsights(watchlistSymbols);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Watchlist</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">{watchlist.length} stocks tracked</span>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search and add stocks to watchlist..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg border border-gray-600 shadow-lg z-10 max-h-60 overflow-y-auto">
            {searchResults.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleAddToWatchlist(stock)}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-white">{stock.symbol}</div>
                  <div className="text-sm text-gray-400">{stock.name}</div>
                  <div className="text-xs text-gray-500">{stock.sector}</div>
                </div>
                <div className="text-right">
                  <div className="text-white">${stock.price.toFixed(2)}</div>
                  <div className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Items */}
        <div className="lg:col-span-2">
          {watchlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-12 text-center"
            >
              <Star className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Your watchlist is empty</h3>
              <p className="text-gray-500 mb-6">Add stocks to track their performance and get AI insights</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Stock
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {watchlist.map((item, index) => {
                const stock = stockData[item.symbol];
                const status = getWatchlistItemStatus(item.symbol);
                
                return (
                  <motion.div
                    key={item.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-white">{item.symbol}</h3>
                            {status?.status === 'target-reached' && <CheckCircle className="h-5 w-5 text-green-400" />}
                            {status?.status === 'near-target' && <Target className="h-5 w-5 text-yellow-400" />}
                            {status?.status === 'strong-gain' && <TrendingUp className="h-5 w-5 text-green-400" />}
                            {status?.status === 'strong-loss' && <TrendingDown className="h-5 w-5 text-red-400" />}
                          </div>
                          <p className="text-gray-400">{stock?.name || 'Loading...'}</p>
                          {status?.message && (
                            <p className={`text-sm mt-1 ${
                              status.status === 'target-reached' || status.status === 'strong-gain' ? 'text-green-400' :
                              status.status === 'near-target' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {status.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditWatchlistItem(item.symbol)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromWatchlist(item.symbol)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {stock && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Current Price</p>
                          <p className="text-white font-semibold text-lg">${stock.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Change</p>
                          <p className={`font-semibold text-lg ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Change %</p>
                          <p className={`font-semibold text-lg flex items-center ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                            {stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Volume</p>
                          <p className="text-white font-semibold">{(stock.volume / 1e6).toFixed(1)}M</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.targetPrice && (
                        <div className="bg-gray-700 rounded-lg p-3">
                          <p className="text-gray-400 text-sm">Target Price</p>
                          <p className="text-white font-semibold">${item.targetPrice.toFixed(2)}</p>
                          {stock && (
                            <p className={`text-sm ${
                              stock.price >= item.targetPrice ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {stock.price >= item.targetPrice ? 'Target Reached!' : 
                               `${((item.targetPrice - stock.price) / stock.price * 100).toFixed(1)}% to target`}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="bg-gray-700 rounded-lg p-3">
                          <p className="text-gray-400 text-sm">Notes</p>
                          <p className="text-white text-sm">{item.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Insights Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Watchlist Insights</h3>
            
            <div className="space-y-3">
              {relevantInsights.length > 0 ? (
                relevantInsights.slice(0, 5).map((insight) => (
                  <div key={insight.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start space-x-2 mb-2">
                      {insight.type === 'opportunity' && <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />}
                      {insight.type === 'risk' && <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />}
                      {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5" />}
                      {insight.type === 'alert' && <Info className="h-4 w-4 text-orange-400 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{insight.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            {insight.relevantSymbols.filter(symbol => watchlistSymbols.includes(symbol)).map(symbol => (
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
                  <p className="text-gray-500 text-xs">Add stocks to see AI insights</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Tracked</span>
                <span className="text-white font-semibold">{watchlist.length} stocks</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Gainers Today</span>
                <span className="text-green-400 font-semibold">
                  {watchlist.filter(item => {
                    const stock = stockData[item.symbol];
                    return stock && stock.change > 0;
                  }).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Losers Today</span>
                <span className="text-red-400 font-semibold">
                  {watchlist.filter(item => {
                    const stock = stockData[item.symbol];
                    return stock && stock.change < 0;
                  }).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">At Target</span>
                <span className="text-yellow-400 font-semibold">
                  {watchlist.filter(item => {
                    const stock = stockData[item.symbol];
                    return stock && item.targetPrice && stock.price >= item.targetPrice;
                  }).length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Add Stock to Watchlist</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Symbol</label>
                <input
                  type="text"
                  value={newWatchItem.symbol}
                  onChange={(e) => setNewWatchItem(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AAPL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newWatchItem.targetPrice}
                  onChange={(e) => setNewWatchItem(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="200.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Notes (Optional)</label>
                <textarea
                  value={newWatchItem.notes}
                  onChange={(e) => setNewWatchItem(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Add your thoughts or reasons for tracking this stock..."
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
                onClick={() => handleAddToWatchlist()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSymbol && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Edit {editingSymbol}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editValues.targetPrice}
                  onChange={(e) => setEditValues(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="200.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                <textarea
                  value={editValues.notes}
                  onChange={(e) => setEditValues(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Add your thoughts..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setEditingSymbol(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
