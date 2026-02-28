"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StockCard, MarketIndex } from "@/components/StockCard";
import { NewsCard } from "@/components/NewsCardV2";
import { PortfolioAlerts } from "@/components/PortfolioAlerts";

interface LiveUpdate {
  headline: string;
  source: string;
  time: string;
  url: string;
}

interface MarketSentiment {
  region: string;
  sentimentScore: number;
  sentimentLabel: string;
  summary: string;
  liveUpdates: LiveUpdate[];
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
}

interface MarketIndexData {
  name: string;
  value: number;
  change: number;
}

interface NewsItem {
  ticker: string;
  title: string;
  summary: string;
  date: string;
  sentiment?: "bullish" | "bearish" | "neutral";
  category?: string;
  source?: string;
}

interface DashboardTabProps {
  stockData: StockQuote[];
  marketIndices: MarketIndexData[];
  marketSentiment: MarketSentiment | null;
  news: NewsItem[];
  loading: boolean;
  portfolio: string[];
}

function DashboardTabInner({
  stockData,
  marketIndices,
  marketSentiment,
  news,
  loading,
}: DashboardTabProps) {
  return (
    <>
      {/* Page Title + Sentiment Badge */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400">
            Market indices + Your portfolio stocks
          </p>
        </div>
        {marketSentiment && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex gap-4 items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                marketSentiment.sentimentLabel === "Bullish"
                  ? "bg-green-500 shadow-[0_0_10px_#22c55e]"
                  : marketSentiment.sentimentLabel === "Bearish"
                    ? "bg-red-500 shadow-[0_0_10px_#ef4444]"
                    : "bg-gray-400"
              }`}
            />
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                AI Sentiment
              </div>
              <div className="font-bold flex items-center gap-2">
                {marketSentiment.sentimentLabel}
                <span className="text-sm font-normal text-gray-400">
                  ({(marketSentiment.sentimentScore * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Summary Banner */}
      {marketSentiment && (
        <div className="mb-8 p-5 bg-blue-600/10 border border-blue-500/20 rounded-2xl relative overflow-hidden group">
          <div className="flex gap-4 items-start relative z-10">
            <div
              className="p-3 bg-blue-600/20 rounded-xl text-2xl"
              aria-hidden="true"
            >
              🤖
            </div>
            <div>
              <p className="text-blue-200 text-sm leading-relaxed italic">
                &quot;{marketSentiment.summary}&quot;
              </p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
        </div>
      )}

      {/* Stock Price Cards */}
      {stockData.length > 0 && (
        <div
          className="flex gap-4 mb-6 overflow-x-auto pb-2"
          role="list"
          aria-label="Portfolio stocks"
        >
          {stockData.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              price={stock.price}
              change={stock.change}
            />
          ))}
        </div>
      )}

      {/* Market Indices */}
      <div
        className="grid grid-cols-4 gap-4 mb-8"
        role="list"
        aria-label="Market indices"
      >
        {marketIndices.length > 0 ? (
          marketIndices.map((index) => (
            <MarketIndex key={index.name} {...index} />
          ))
        ) : (
          <div className="col-span-4 py-8 bg-gray-800/20 border border-gray-700/30 rounded-2xl text-center text-gray-500">
            {loading
              ? "Fetching global market data..."
              : "Real-time market indices currently unavailable."}
          </div>
        )}
      </div>

      {/* News + Alerts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Market News Column */}
        <div className="col-span-2 space-y-8">
          {/* Live Updates Ticker */}
          {marketSentiment?.liveUpdates &&
            marketSentiment.liveUpdates.length > 0 && (
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                    Latest Live Updates
                  </h2>
                </div>
                <div className="space-y-4">
                  {marketSentiment.liveUpdates.slice(0, 5).map((update) => (
                    <a
                      key={update.url}
                      href={update.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-start group border-b border-gray-700/30 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-white group-hover:text-blue-400 transition-colors">
                          {update.headline}
                        </p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-gray-500 font-bold">
                            {update.source}
                          </span>
                          <span className="text-xs text-gray-400">
                            {update.time}
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-gray-600 group-hover:text-blue-400"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Market News</h2>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="p-5 rounded-2xl bg-gray-800/50 border border-gray-700"
                  >
                    <Skeleton className="h-5 w-24 mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {news.slice(0, 3).map((item) => (
                  <NewsCard
                    key={`${item.ticker}-${item.title}`}
                    title={item.title}
                    summary={item.summary}
                    ticker={item.ticker}
                    sentiment={item.sentiment}
                    category={item.category}
                    source={item.source}
                    time={
                      item.date
                        ? new Date(item.date).toLocaleDateString()
                        : undefined
                    }
                  />
                ))}
                {news.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No news yet. Add tickers to your portfolio to get
                    personalized news.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Alerts Column */}
        <div className="col-span-1">
          <PortfolioAlerts />
        </div>
      </div>
    </>
  );
}

export const DashboardTab = memo(DashboardTabInner);
