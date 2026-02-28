'use client';

import { Bookmark, ExternalLink, Clock } from 'lucide-react';

interface NewsCardProps {
  title: string;
  summary: string;
  ticker?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  category?: string;
  source?: string;
  time?: string;
}

export function NewsCard({
  title,
  summary,
  ticker,
  sentiment,
  category,
  source,
  time,
}: NewsCardProps) {
  const getSentimentStyles = () => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'bearish':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-all group">
      {/* Header with badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {sentiment && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSentimentStyles()}`}>
              ↗ {sentiment}
            </span>
          )}
          {category && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600">
              {category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
        {title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {summary}
      </p>

      {/* Ticker tag */}
      {ticker && (
        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-3">
          ${ticker}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-700/50">
        <span className="font-medium">{source || 'MarketMind'}</span>
        {time && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
