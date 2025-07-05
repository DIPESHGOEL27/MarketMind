import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  ExternalLink,
  Star,
  Share2,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useMarketData } from '../contexts/MarketDataContext';
import { useSentiment } from '../contexts/SentimentContext';

const News: React.FC = () => {
  const { news } = useMarketData();
  const { analyzedNews, analyzeNews, getPersonalizedNews } = useSentiment();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeNews = async () => {
      if (news.length > 0 && analyzedNews.length === 0) {
        setLoading(true);
        await analyzeNews(news);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    initializeNews();
  }, [news, analyzedNews, analyzeNews]);

  useEffect(() => {
    let filtered = analyzedNews.length > 0 ? analyzedNews : news;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.relevantSymbols.some((symbol: string) => 
          symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by sentiment
    if (selectedSentiment !== 'All') {
      filtered = filtered.filter(article => article.sentiment === selectedSentiment.toLowerCase());
    }

    setFilteredNews(filtered);
  }, [searchQuery, selectedCategory, selectedSentiment, analyzedNews, news]);

  const categories = ['All', 'Earnings', 'Company News', 'Economic Policy', 'Market Analysis', 'Technology'];
  const sentiments = ['All', 'Bullish', 'Bearish', 'Neutral'];

  const handleShare = (article: any) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(article.url);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-600 text-white';
      case 'bearish':
        return 'bg-red-600 text-white';
      default:
        return 'bg-yellow-600 text-white';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const personalizedNews = getPersonalizedNews(5);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing news with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Market News</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            {filteredNews.length} articles • AI analyzed
          </span>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-blue-400">FinBERT Powered</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedSentiment}
          onChange={(e) => setSelectedSentiment(e.target.value)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sentiments.map(sentiment => (
            <option key={sentiment} value={sentiment}>{sentiment}</option>
          ))}
        </select>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>More Filters</span>
        </button>
      </div>

      {/* Personalized News Section */}
      {personalizedNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Personalized for You</h2>
            <span className="text-sm text-blue-200">Based on your watchlist</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalizedNews.slice(0, 3).map((article) => (
              <div key={article.id} className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(article.sentiment)}`}>
                    {article.sentiment.toUpperCase()}
                  </span>
                  <span className="text-xs text-blue-200">
                    {article.aiAnalysis?.confidence ? `${Math.round(article.aiAnalysis.confidence * 100)}%` : ''}
                  </span>
                </div>
                <h3 className="font-medium text-white text-sm mb-2 line-clamp-2">{article.title}</h3>
                <div className="flex items-center space-x-2">
                  {article.relevantSymbols.slice(0, 2).map((symbol: string) => (
                    <span key={symbol} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNews.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors"
          >
            {article.imageUrl && (
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${getSentimentColor(article.sentiment)}`}>
                    {getSentimentIcon(article.sentiment)}
                    <span>{article.sentiment.toUpperCase()}</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    {article.category}
                  </span>
                </div>
                {article.aiAnalysis && (
                  <span className="text-xs text-gray-400">
                    {Math.round(article.aiAnalysis.confidence * 100)}% confidence
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 hover:text-blue-400 transition-colors">
                {article.title}
              </h3>

              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {article.summary}
              </p>

              {article.aiAnalysis && (
                <div className="bg-gray-700 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">AI Analysis</span>
                  </div>
                  <p className="text-gray-300 text-xs">{article.aiAnalysis.analysis}</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400">{article.source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShare(article)}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                    <Star className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {article.relevantSymbols.slice(0, 3).map((symbol: string) => (
                    <span key={symbol} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      {symbol}
                    </span>
                  ))}
                  {article.relevantSymbols.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{article.relevantSymbols.length - 3} more
                    </span>
                  )}
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  <span>Read more</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No news found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default News;
