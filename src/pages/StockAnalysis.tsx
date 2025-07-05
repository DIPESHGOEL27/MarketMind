import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Star, 
  Plus,
  Filter,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { useMarketData } from '../contexts/MarketDataContext';
import { useSentiment } from '../contexts/SentimentContext';

const StockAnalysis: React.FC = () => {
  const { 
    stockData, 
    searchStocks, 
    getStockData, 
    addToWatchlist, 
    removeFromWatchlist, 
    watchlist,
    getTopMovers,
    getSectorPerformance,
    isLoading 
  } = useMarketData();
  
  const { 
    analyzeSentiment, 
    generateInsights, 
    insights,
    isAnalyzing 
  } = useSentiment();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterSector, setFilterSector] = useState('All');

  useEffect(() => {
    // Load initial data
    if (Object.keys(stockData).length > 0) {
      const firstStock = Object.values(stockData)[0];
      setSelectedStock(firstStock);
    }
  }, [stockData]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      const results = await searchStocks(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStock = async (stock: any) => {
    setSelectedStock(stock);
    setSearchQuery('');
    setSearchResults([]);
    
    // Get detailed stock data
    const detailedData = await getStockData(stock.symbol);
    if (detailedData) {
      setSelectedStock(detailedData);
    }
    
    // Analyze sentiment for the stock
    const sentiment = await analyzeSentiment(`${stock.name} ${stock.symbol} stock analysis`);
    setSentimentAnalysis(sentiment);
  };

  const handleAddToWatchlist = (stock: any) => {
    addToWatchlist(stock.symbol);
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    removeFromWatchlist(symbol);
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  const topMovers = getTopMovers();
  const sectorPerformance = getSectorPerformance();
  const sectors = ['All', ...Object.keys(sectorPerformance)];

  const filteredTopMovers = filterSector === 'All' 
    ? topMovers 
    : topMovers.filter(stock => stock.sector === filterSector);

  const stockInsights = selectedStock 
    ? insights.filter(insight => insight.relevantSymbols.includes(selectedStock.symbol))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Stock Analysis</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1D">1 Day</option>
            <option value="1W">1 Week</option>
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="1Y">1 Year</option>
          </select>
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search stocks (e.g., AAPL, Tesla, Apple Inc.)"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg border border-gray-600 shadow-lg z-10">
            {searchResults.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelectStock(stock)}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-white">{stock.symbol}</div>
                  <div className="text-sm text-gray-400">{stock.name}</div>
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
        {/* Main Analysis Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Stock Details */}
          {selectedStock && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedStock.symbol}</h2>
                    <p className="text-gray-400">{selectedStock.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">${selectedStock.price.toFixed(2)}</div>
                    <div className={`flex items-center ${selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedStock.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => isInWatchlist(selectedStock.symbol) 
                    ? handleRemoveFromWatchlist(selectedStock.symbol)
                    : handleAddToWatchlist(selectedStock)
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    isInWatchlist(selectedStock.symbol)
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {isInWatchlist(selectedStock.symbol) ? <Star className="h-5 w-5 fill-current" /> : <Plus className="h-5 w-5" />}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6">
                {['overview', 'technical', 'fundamentals', 'news'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Market Cap</p>
                      <p className="text-white font-semibold">${(selectedStock.marketCap / 1e9).toFixed(1)}B</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Volume</p>
                      <p className="text-white font-semibold">{(selectedStock.volume / 1e6).toFixed(1)}M</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">P/E Ratio</p>
                      <p className="text-white font-semibold">{selectedStock.pe?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">52W Range</p>
                      <p className="text-white font-semibold">${selectedStock.low52Week} - ${selectedStock.high52Week}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'technical' && (
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-4">Technical Indicators</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">RSI (14)</p>
                          <p className="text-white font-semibold">67.3</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">MACD</p>
                          <p className="text-green-400 font-semibold">+2.45</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">MA (50)</p>
                          <p className="text-white font-semibold">${(selectedStock.price * 0.95).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Beta</p>
                          <p className="text-white font-semibold">{selectedStock.beta?.toFixed(2) || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'fundamentals' && (
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-4">Key Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Sector</p>
                          <p className="text-white font-semibold">{selectedStock.sector}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Industry</p>
                          <p className="text-white font-semibold">{selectedStock.industry}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Dividend Yield</p>
                          <p className="text-white font-semibold">{selectedStock.dividendYield?.toFixed(2) || '0.00'}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Last Updated</p>
                          <p className="text-white font-semibold">{new Date(selectedStock.lastUpdated).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'news' && (
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-4">Related News</h3>
                      <p className="text-gray-400">News analysis for {selectedStock.symbol} will appear here.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* AI Sentiment Analysis */}
          {sentimentAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">AI Sentiment Analysis</h3>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Sentiment</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sentimentAnalysis.sentiment === 'bullish' ? 'bg-green-600 text-white' :
                    sentimentAnalysis.sentiment === 'bearish' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {sentimentAnalysis.sentiment.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Confidence</span>
                  <span className="text-white font-semibold">{Math.round(sentimentAnalysis.confidence * 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Score</span>
                  <span className="text-white font-semibold">{sentimentAnalysis.score.toFixed(2)}</span>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm">{sentimentAnalysis.analysis}</p>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Movers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Top Movers</h3>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              {filteredTopMovers.slice(0, 5).map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock)}
                  className="w-full flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="text-left">
                    <div className="font-medium text-white">{stock.symbol}</div>
                    <div className="text-xs text-gray-400">{stock.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">${stock.price.toFixed(2)}</div>
                    <div className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stock Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Stock Insights</h3>
            
            <div className="space-y-3">
              {stockInsights.length > 0 ? (
                stockInsights.map((insight) => (
                  <div key={insight.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start space-x-2 mb-2">
                      {insight.type === 'opportunity' && <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />}
                      {insight.type === 'risk' && <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />}
                      {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5" />}
                      {insight.type === 'alert' && <Info className="h-4 w-4 text-orange-400 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{insight.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            insight.priority === 'high' ? 'bg-red-600 text-white' :
                            insight.priority === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-green-600 text-white'
                          }`}>
                            {insight.priority.toUpperCase()}
                          </span>
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
                  <p className="text-gray-500 text-xs">Select a stock to see AI insights</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;
