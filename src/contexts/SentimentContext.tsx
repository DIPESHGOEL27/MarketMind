import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MarketNews } from './MarketDataContext';

export interface SentimentAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  keywords: string[];
  entities: string[];
  analysis: string;
}

export interface NewsAnalysis extends MarketNews {
  aiAnalysis: SentimentAnalysis;
  technicalSignals?: {
    rsi: number;
    macd: number;
    movingAverage: number;
    support: number;
    resistance: number;
  };
}

export interface PersonalizedInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'alert';
  title: string;
  description: string;
  relevantSymbols: string[];
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  createdAt: string;
  actionable: boolean;
  dismissible: boolean;
}

export interface UserBehavior {
  viewedSymbols: string[];
  searchHistory: string[];
  favoriteSymbols: string[];
  tradingActivity: {
    symbol: string;
    action: 'buy' | 'sell' | 'hold';
    timestamp: string;
  }[];
  sectorPreferences: Record<string, number>;
  riskTolerance: 'low' | 'medium' | 'high';
  investmentGoals: string[];
}

interface SentimentContextType {
  // Sentiment analysis
  isAnalyzing: boolean;
  error: string | null;
  
  // News analysis
  analyzedNews: NewsAnalysis[];
  
  // Personalized insights
  insights: PersonalizedInsight[];
  userBehavior: UserBehavior;
  
  // Actions
  analyzeNews: (news: MarketNews[]) => Promise<NewsAnalysis[]>;
  analyzeSentiment: (text: string) => Promise<SentimentAnalysis>;
  generateInsights: (symbols: string[]) => Promise<PersonalizedInsight[]>;
  updateUserBehavior: (behavior: Partial<UserBehavior>) => void;
  dismissInsight: (insightId: string) => void;
  
  // Filtering and personalization
  getPersonalizedNews: (limit?: number) => NewsAnalysis[];
  getRelevantInsights: (symbols: string[]) => PersonalizedInsight[];
  updatePreferences: (preferences: Partial<UserBehavior>) => void;
}

const SentimentContext = createContext<SentimentContextType | undefined>(undefined);

export const useSentiment = () => {
  const context = useContext(SentimentContext);
  if (context === undefined) {
    throw new Error('useSentiment must be used within a SentimentProvider');
  }
  return context;
};

export const SentimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedNews, setAnalyzedNews] = useState<NewsAnalysis[]>([]);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    viewedSymbols: [],
    searchHistory: [],
    favoriteSymbols: [],
    tradingActivity: [],
    sectorPreferences: {},
    riskTolerance: 'medium',
    investmentGoals: []
  });

  // Load user behavior from localStorage
  useEffect(() => {
    const savedBehavior = localStorage.getItem('marketmind-user-behavior');
    if (savedBehavior) {
      setUserBehavior(JSON.parse(savedBehavior));
    }
  }, []);

  // Mock FinBERT analysis - in real app, this would call your ML API
  const mockFinBERTAnalysis = (text: string): SentimentAnalysis => {
    // Simple keyword-based analysis for demo
    const bullishKeywords = ['growth', 'increase', 'positive', 'strong', 'beat', 'exceed', 'rise', 'gain', 'bullish', 'optimistic'];
    const bearishKeywords = ['decline', 'decrease', 'negative', 'weak', 'miss', 'fall', 'drop', 'bearish', 'concern', 'risk'];
    
    const lowerText = text.toLowerCase();
    const bullishCount = bullishKeywords.filter(word => lowerText.includes(word)).length;
    const bearishCount = bearishKeywords.filter(word => lowerText.includes(word)).length;
    
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let score = 0;
    
    if (bullishCount > bearishCount) {
      sentiment = 'bullish';
      score = Math.min(bullishCount * 0.2, 1);
    } else if (bearishCount > bullishCount) {
      sentiment = 'bearish';
      score = -Math.min(bearishCount * 0.2, 1);
    }
    
    const confidence = Math.min((bullishCount + bearishCount) * 0.15, 0.95);
    
    return {
      sentiment,
      score,
      confidence,
      keywords: [...bullishKeywords, ...bearishKeywords].filter(word => lowerText.includes(word)),
      entities: [], // Would extract entities in real implementation
      analysis: `Sentiment analysis shows ${sentiment} sentiment with ${Math.round(confidence * 100)}% confidence based on ${bullishCount + bearishCount} key indicators.`
    };
  };

  const analyzeNews = useCallback(async (news: MarketNews[]): Promise<NewsAnalysis[]> => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analyzed = news.map(item => ({
        ...item,
        aiAnalysis: mockFinBERTAnalysis(item.title + ' ' + item.summary),
        technicalSignals: {
          rsi: Math.random() * 100,
          macd: (Math.random() - 0.5) * 2,
          movingAverage: Math.random() * 200,
          support: Math.random() * 100,
          resistance: Math.random() * 200
        }
      }));
      
      setAnalyzedNews(analyzed);
      return analyzed;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze news');
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeSentiment = useCallback(async (text: string): Promise<SentimentAnalysis> => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockFinBERTAnalysis(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze sentiment');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateInsights = useCallback(async (symbols: string[]): Promise<PersonalizedInsight[]> => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockInsights: PersonalizedInsight[] = [
        {
          id: '1',
          type: 'opportunity',
          title: 'Strong Technical Breakout Detected',
          description: 'AAPL has broken above key resistance levels with strong volume, indicating potential upward momentum.',
          relevantSymbols: ['AAPL'],
          confidence: 0.82,
          priority: 'high',
          category: 'Technical Analysis',
          createdAt: new Date().toISOString(),
          actionable: true,
          dismissible: true
        },
        {
          id: '2',
          type: 'risk',
          title: 'Sector Rotation Alert',
          description: 'Technology sector showing signs of weakness. Consider diversifying into defensive sectors.',
          relevantSymbols: ['AAPL', 'GOOGL', 'MSFT'],
          confidence: 0.67,
          priority: 'medium',
          category: 'Sector Analysis',
          createdAt: new Date().toISOString(),
          actionable: true,
          dismissible: true
        },
        {
          id: '3',
          type: 'trend',
          title: 'EV Market Momentum',
          description: 'Electric vehicle stocks showing strong correlation with renewable energy policies. TSLA leading the trend.',
          relevantSymbols: ['TSLA'],
          confidence: 0.75,
          priority: 'medium',
          category: 'Thematic Investing',
          createdAt: new Date().toISOString(),
          actionable: false,
          dismissible: true
        },
        {
          id: '4',
          type: 'alert',
          title: 'Earnings Season Impact',
          description: 'Q4 earnings reports may cause increased volatility. Monitor your positions closely.',
          relevantSymbols: symbols,
          confidence: 0.90,
          priority: 'high',
          category: 'Market Events',
          createdAt: new Date().toISOString(),
          actionable: true,
          dismissible: false
        }
      ];
      
      setInsights(mockInsights);
      return mockInsights;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const updateUserBehavior = useCallback((behavior: Partial<UserBehavior>) => {
    setUserBehavior(prev => {
      const updated = { ...prev, ...behavior };
      localStorage.setItem('marketmind-user-behavior', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const dismissInsight = useCallback((insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  }, []);

  const getPersonalizedNews = useCallback((limit: number = 10): NewsAnalysis[] => {
    // Filter news based on user preferences
    const filtered = analyzedNews.filter(news => 
      news.relevantSymbols.some(symbol => 
        userBehavior.viewedSymbols.includes(symbol) || 
        userBehavior.favoriteSymbols.includes(symbol)
      )
    );
    
    // Sort by relevance and sentiment confidence
    const sorted = filtered.sort((a, b) => {
      const aRelevance = a.relevantSymbols.filter(s => userBehavior.favoriteSymbols.includes(s)).length;
      const bRelevance = b.relevantSymbols.filter(s => userBehavior.favoriteSymbols.includes(s)).length;
      
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance;
      }
      
      return b.aiAnalysis.confidence - a.aiAnalysis.confidence;
    });
    
    return sorted.slice(0, limit);
  }, [analyzedNews, userBehavior]);

  const getRelevantInsights = useCallback((symbols: string[]): PersonalizedInsight[] => {
    return insights.filter(insight => 
      insight.relevantSymbols.some(symbol => symbols.includes(symbol))
    ).sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });
  }, [insights]);

  const updatePreferences = useCallback((preferences: Partial<UserBehavior>) => {
    updateUserBehavior(preferences);
  }, [updateUserBehavior]);

  const value: SentimentContextType = {
    isAnalyzing,
    error,
    analyzedNews,
    insights,
    userBehavior,
    analyzeNews,
    analyzeSentiment,
    generateInsights,
    updateUserBehavior,
    dismissInsight,
    getPersonalizedNews,
    getRelevantInsights,
    updatePreferences
  };

  return (
    <SentimentContext.Provider value={value}>
      {children}
    </SentimentContext.Provider>
  );
};
