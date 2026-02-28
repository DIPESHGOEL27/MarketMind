"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function MarketNews() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketNews = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 h-full">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Newspaper className="w-4 h-4" /> Market Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[85%]" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Newspaper className="w-4 h-4" /> Market Brief
          </CardTitle>
          {lastUpdated && (
            <span className="text-xs text-zinc-400">Updated {lastUpdated}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
