import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe?: number;
  dividendYield?: number;
  high52Week: number;
  low52Week: number;
  beta?: number;
  sector: string;
  industry: string;
  lastUpdated: string;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  relevantSymbols: string[];
  category: string;
  imageUrl?: string;
}

export interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  confidence: number;
  lastUpdated: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
  targetPrice?: number;
  notes?: string;
}

interface MarketDataContextType {
  // Stock data
  stockData: Record<string, StockData>;
  isLoading: boolean;
  error: string | null;
  
  // News and sentiment
  news: MarketNews[];
  sentiment: MarketSentiment;
  
  // Watchlist
  watchlist: WatchlistItem[];
  
  // Actions
  getStockData: (symbol: string) => Promise<StockData | null>;
  getMultipleStocks: (symbols: string[]) => Promise<StockData[]>;
  searchStocks: (query: string) => Promise<StockData[]>;
  addToWatchlist: (symbol: string, targetPrice?: number, notes?: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  refreshData: () => Promise<void>;
  
  // Market analysis
  getTopMovers: () => StockData[];
  getTopVolume: () => StockData[];
  getSectorPerformance: () => Record<string, number>;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

export const MarketDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [news, setNews] = useState<MarketNews[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment>({
    overall: 'neutral',
    score: 0,
    bullishCount: 0,
    bearishCount: 0,
    neutralCount: 0,
    confidence: 0,
    lastUpdated: new Date().toISOString()
  });
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockStockData: Record<string, StockData> = {
    'AAPL': {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 185.45,
      change: 2.35,
      changePercent: 1.28,
      volume: 45123000,
      marketCap: 2890000000000,
      pe: 24.5,
      dividendYield: 0.52,
      high52Week: 198.23,
      low52Week: 124.17,
      beta: 1.25,
      sector: 'Technology',
      industry: 'Consumer Electronics',
      lastUpdated: new Date().toISOString()
    },
    'GOOGL': {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 135.22,
      change: -1.45,
      changePercent: -1.06,
      volume: 28945000,
      marketCap: 1720000000000,
      pe: 22.8,
      dividendYield: 0,
      high52Week: 151.55,
      low52Week: 83.34,
      beta: 1.15,
      sector: 'Technology',
      industry: 'Internet Content & Information',
      lastUpdated: new Date().toISOString()
    },
    'MSFT': {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 378.85,
      change: 4.12,
      changePercent: 1.10,
      volume: 22456000,
      marketCap: 2810000000000,
      pe: 28.3,
      dividendYield: 0.68,
      high52Week: 384.30,
      low52Week: 213.43,
      beta: 0.95,
      sector: 'Technology',
      industry: 'Software',
      lastUpdated: new Date().toISOString()
    },
    'TSLA': {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 248.50,
      change: 8.75,
      changePercent: 3.65,
      volume: 67834000,
      marketCap: 789000000000,
      pe: 45.2,
      dividendYield: 0,
      high52Week: 299.29,
      low52Week: 101.81,
      beta: 2.08,
      sector: 'Consumer Discretionary',
      industry: 'Auto Manufacturers',
      lastUpdated: new Date().toISOString()
    }
  };

  const mockNews: MarketNews[] = [
    {
      id: '1',
      title: 'Apple Reports Strong Q4 Earnings, iPhone Sales Exceed Expectations',
      summary: 'Apple Inc. reported quarterly earnings that beat Wall Street estimates, driven by strong iPhone sales and services revenue growth.',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url: 'https://example.com/apple-earnings',
      sentiment: 'bullish',
      sentimentScore: 0.78,
      relevantSymbols: ['AAPL'],
      category: 'Earnings',
      imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Tesla Announces New Gigafactory in Southeast Asia',
      summary: 'Tesla revealed plans for a new manufacturing facility to meet growing demand in the Asian market.',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      url: 'https://example.com/tesla-gigafactory',
      sentiment: 'bullish',
      sentimentScore: 0.65,
      relevantSymbols: ['TSLA'],
      category: 'Company News',
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'Federal Reserve Signals Potential Interest Rate Changes',
      summary: 'The Fed\'s latest meeting minutes suggest policy makers are considering adjustments to interest rates in response to inflation data.',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      url: 'https://example.com/fed-rates',
      sentiment: 'bearish',
      sentimentScore: -0.42,
      relevantSymbols: ['SPY', 'QQQ'],
      category: 'Economic Policy',
      imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&h=200&fit=crop'
    }
  ];

  useEffect(() => {
    // Initialize with mock data
    setStockData(mockStockData);
    setNews(mockNews);
    setSentiment({
      overall: 'bullish',
      score: 0.15,
      bullishCount: 65,
      bearishCount: 25,
      neutralCount: 10,
      confidence: 0.82,
      lastUpdated: new Date().toISOString()
    });

    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem('marketmind-watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  const getStockData = useCallback(async (symbol: string): Promise<StockData | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would make an API call
      // For now, return mock data
      const stock = mockStockData[symbol.toUpperCase()];
      if (stock) {
        setStockData(prev => ({ ...prev, [symbol]: stock }));
        return stock;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMultipleStocks = useCallback(async (symbols: string[]): Promise<StockData[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stocks = symbols.map(symbol => mockStockData[symbol.toUpperCase()]).filter(Boolean);
      return stocks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks data');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchStocks = useCallback(async (query: string): Promise<StockData[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const results = Object.values(mockStockData).filter(stock => 
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(query.toLowerCase())
      );
      
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search stocks');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToWatchlist = useCallback((symbol: string, targetPrice?: number, notes?: string) => {
    const newItem: WatchlistItem = {
      symbol: symbol.toUpperCase(),
      addedAt: new Date().toISOString(),
      targetPrice,
      notes
    };
    
    setWatchlist(prev => {
      const updated = [...prev.filter(item => item.symbol !== symbol), newItem];
      localStorage.setItem('marketmind-watchlist', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => {
      const updated = prev.filter(item => item.symbol !== symbol.toUpperCase());
      localStorage.setItem('marketmind-watchlist', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would refresh all data from APIs
      // For now, just update timestamps
      const updatedStockData = Object.fromEntries(
        Object.entries(stockData).map(([symbol, data]) => [
          symbol,
          { ...data, lastUpdated: new Date().toISOString() }
        ])
      );
      
      setStockData(updatedStockData);
      setSentiment(prev => ({ ...prev, lastUpdated: new Date().toISOString() }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [stockData]);

  const getTopMovers = useCallback(() => {
    return Object.values(stockData)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 10);
  }, [stockData]);

  const getTopVolume = useCallback(() => {
    return Object.values(stockData)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
  }, [stockData]);

  const getSectorPerformance = useCallback(() => {
    const sectors: Record<string, number[]> = {};
    
    Object.values(stockData).forEach(stock => {
      if (!sectors[stock.sector]) {
        sectors[stock.sector] = [];
      }
      sectors[stock.sector].push(stock.changePercent);
    });
    
    return Object.fromEntries(
      Object.entries(sectors).map(([sector, changes]) => [
        sector,
        changes.reduce((sum, change) => sum + change, 0) / changes.length
      ])
    );
  }, [stockData]);

  const value: MarketDataContextType = {
    stockData,
    isLoading,
    error,
    news,
    sentiment,
    watchlist,
    getStockData,
    getMultipleStocks,
    searchStocks,
    addToWatchlist,
    removeFromWatchlist,
    refreshData,
    getTopMovers,
    getTopVolume,
    getSectorPerformance
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};
