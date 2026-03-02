"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function MarketNews() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketNews = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/market-news`);
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
          if (data.updated) {
            setLastUpdated(
              new Date(data.updated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            );
          }
        }
      } catch (e) {
        console.error("Failed to fetch market news", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketNews();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            AI Market Brief
          </span>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full bg-white/[.06]" />
          <Skeleton className="h-4 w-[90%] bg-white/[.06]" />
          <Skeleton className="h-4 w-[95%] bg-white/[.06]" />
          <Skeleton className="h-4 w-[85%] bg-white/[.06]" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            AI Market Brief
          </span>
        </div>
        {lastUpdated && (
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <Clock className="h-3 w-3" />
            {lastUpdated}
          </span>
        )}
      </div>
      <div className="prose prose-sm prose-invert max-w-none text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-blue-400">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}
