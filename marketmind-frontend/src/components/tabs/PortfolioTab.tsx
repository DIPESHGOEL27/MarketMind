"use client";

import { useState, useCallback, memo } from "react";
import { TickerSearch } from "@/components/TickerSearch";
import { Plus, X, Briefcase } from "lucide-react";

interface PortfolioTabProps {
  portfolio: string[];
  onAddTicker: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
}

function PortfolioTabInner({
  portfolio,
  onAddTicker,
  onRemoveTicker,
}: PortfolioTabProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = useCallback(
    (ticker: string) => {
      setIsAdding(true);
      onAddTicker(ticker);
      // Brief visual feedback
      setTimeout(() => setIsAdding(false), 300);
    },
    [onAddTicker],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-blue-400" />
          Portfolio
        </h1>
        <p className="text-gray-400">Manage your stock watchlist</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <TickerSearch onSelect={handleAdd} isLoading={isAdding} />
          <span className="text-sm text-gray-500">
            {portfolio.length} ticker{portfolio.length !== 1 ? "s" : ""} tracked
          </span>
        </div>

        {portfolio.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {portfolio.map((ticker) => (
              <div
                key={ticker}
                className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex justify-between items-center hover:border-gray-600 transition-colors group"
              >
                <span className="font-bold text-blue-400">{ticker}</span>
                <button
                  onClick={() => onRemoveTicker(ticker)}
                  className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  aria-label={`Remove ${ticker} from portfolio`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Plus className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">
              No tickers in your portfolio yet
            </p>
            <p className="text-sm mt-1">
              Use the search above to add stocks to track
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const PortfolioTab = memo(PortfolioTabInner);
