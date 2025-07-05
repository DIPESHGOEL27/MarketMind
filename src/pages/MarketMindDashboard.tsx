import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Eye, 
  DollarSign, 
  BarChart3, 
  Brain, 
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMarketData } from '../contexts/MarketDataContext';
import { useSentiment } from '../contexts/SentimentContext';
import { useNavigate } from 'react-router-dom';

const MarketMindDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stockData, watchlist, getTopMovers, getSectorPerformance, refreshData, isLoading } = useMarketData();
  const { sentiment, insights, getPersonalizedNews, generateInsights, isAnalyzing } = useSentiment();
  const navigate = useNavigate();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Generate insights for watchlist symbols
    const watchlistSymbols = watchlist.map(item => item.symbol);
    if (watchlistSymbols.length > 0) {
      generateInsights(watchlistSymbols);
    }
  }, [watchlist, generateInsights]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const marketStats = [
    {
      label: 'Market Sentiment',
      value: sentiment.overall,
      icon: Brain,
      color: sentiment.overall === 'bullish' ? 'text-green-400' : sentiment.overall === 'bearish' ? 'text-red-400' : 'text-yellow-400',
      bgColor: sentiment.overall === 'bullish' ? 'bg-green-500' : sentiment.overall === 'bearish' ? 'bg-red-500' : 'bg-yellow-500',
      change: `${Math.round(sentiment.score * 100)}%`,
      changeType: sentiment.overall === 'bullish' ? 'positive' : sentiment.overall === 'bearish' ? 'negative' : 'neutral',
      onClick: () => navigate('/analysis')
    },
    {
      label: 'Active Positions',
      value: watchlist.length,
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500',
      change: '+3',
      changeType: 'positive' as const,
      onClick: () => navigate('/portfolio')
    },
    {
      label: 'News Analyzed',
      value: '2,347',
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500',
      change: '+12%',
      changeType: 'positive' as const,
      onClick: () => navigate('/news')
    },
    {
      label: 'AI Insights',
      value: insights.length,
      icon: Activity,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500',
      change: '+5',
      changeType: 'positive' as const,
      onClick: () => navigate('/analysis')
    }
  ];

  const topMovers = getTopMovers().slice(0, 5);
  const sectorPerformance = getSectorPerformance();
  const personalizedNews = getPersonalizedNews(3);
  const highPriorityInsights = insights.filter(insight => insight.priority === 'high').slice(0, 3);

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to MarketMind</h1>
            <p className="text-blue-100 text-lg">
              AI-powered market analysis at your fingertips
            </p>
            <p className="text-blue-200 mt-2">
              Hello, {user?.name || 'Trader'} • {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-right">
              <p className="text-sm text-blue-200">Last updated</p>
              <p className="text-xs text-blue-300">
                {new Date(sentiment.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor} bg-opacity-20`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-400' : 
                  stat.changeType === 'negative' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {stat.change}
                </p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Movers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Top Movers</h2>
            <button 
              onClick={() => navigate('/analysis')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All <ArrowRight className="h-4 w-4 inline ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {topMovers.map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-semibold text-white">{stock.symbol}</div>
                    <div className="text-sm text-gray-400">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">${stock.price.toFixed(2)}</div>
                  <div className={`text-sm flex items-center ${
                    stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">AI Insights</h2>
            <button 
              onClick={() => navigate('/analysis')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All <ArrowRight className="h-4 w-4 inline ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {highPriorityInsights.length > 0 ? (
              highPriorityInsights.map((insight) => (
                <div key={insight.id} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {insight.type === 'opportunity' && <CheckCircle className="h-4 w-4 text-green-400" />}
                      {insight.type === 'risk' && <AlertCircle className="h-4 w-4 text-red-400" />}
                      {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-blue-400" />}
                      {insight.type === 'alert' && <XCircle className="h-4 w-4 text-orange-400" />}
                      <span className="font-medium text-white text-sm">{insight.title}</span>
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(insight.confidence * 100)}%</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
                  <div className="flex items-center space-x-2">
                    {insight.relevantSymbols.slice(0, 3).map(symbol => (
                      <span key={symbol} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No high-priority insights available</p>
                <p className="text-gray-500 text-sm">Add stocks to your watchlist to get personalized insights</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Sector Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Sector Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(sectorPerformance).map(([sector, performance]) => (
            <div key={sector} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{sector}</span>
                <span className={`text-sm font-semibold ${
                  performance >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {performance >= 0 ? '+' : ''}{performance.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    performance >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(performance) * 10, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent News */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Personalized News</h2>
          <button 
            onClick={() => navigate('/news')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All <ArrowRight className="h-4 w-4 inline ml-1" />
          </button>
        </div>
        <div className="space-y-4">
          {personalizedNews.length > 0 ? (
            personalizedNews.map((news) => (
              <div key={news.id} className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white text-sm leading-tight">{news.title}</h3>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      news.sentiment === 'bullish' ? 'bg-green-600 text-white' :
                      news.sentiment === 'bearish' ? 'bg-red-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {news.sentiment}
                    </span>
                    <span className="text-xs text-gray-400">{news.aiAnalysis.confidence.toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">{news.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{news.source}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(news.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {news.relevantSymbols.slice(0, 2).map(symbol => (
                      <span key={symbol} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No personalized news available</p>
              <p className="text-gray-500 text-sm">News will appear based on your watchlist and preferences</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MarketMindDashboard;
