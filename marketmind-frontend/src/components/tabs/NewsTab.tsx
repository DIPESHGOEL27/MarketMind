"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsCard } from "@/components/NewsCardV2";

interface NewsItem {
  ticker: string;
  title: string;
  summary: string;
  date: string;
  sentiment?: "bullish" | "bearish" | "neutral";
  category?: string;
  source?: string;
}

interface NewsTabProps {
  news: NewsItem[];
  loading: boolean;
}

function NewsTabInner({ news, loading }: NewsTabProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Market News</h1>
        <p className="text-gray-400">
          Real-time financial news with AI-powered insights
        </p>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-2 gap-4">
        {loading
          ? [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-gray-800/50 border border-gray-700"
              >
                <Skeleton className="h-5 w-24 mb-3" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          : news.map((item) => (
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
      </div>

      {!loading && news.length === 0 && (
        <div className="text-center py-12 text-gray-500 mt-4">
          No news available. Add tickers to your portfolio to get personalized
          news.
        </div>
      )}
    </>
  );
}

export const NewsTab = memo(NewsTabInner);
