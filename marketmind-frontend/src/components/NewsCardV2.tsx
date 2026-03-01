"use client";

import { Bookmark, ExternalLink, Clock } from "lucide-react";

interface NewsCardProps {
  title: string;
  summary: string;
  ticker?: string;
  sentiment?: "bullish" | "bearish" | "neutral";
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
  const sentStyles = {
    bullish: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bearish: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="group rounded-xl border border-white/[.06] bg-white/[.02] p-5 transition-all hover:border-white/[.12] hover:bg-white/[.04]">
      {/* Header with badges */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {sentiment && (
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${sentStyles[sentiment]}`}
            >
              {sentiment}
            </span>
          )}
          {category && (
            <span className="rounded-md bg-white/[.04] px-2 py-0.5 text-[10px] text-gray-400">
              {category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="rounded-lg p-1.5 text-gray-500 hover:bg-white/[.06] hover:text-white">
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button className="rounded-lg p-1.5 text-gray-500 hover:bg-white/[.06] hover:text-white">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-1.5 text-sm font-semibold leading-snug text-white">
        {title}
      </h3>

      {/* Summary */}
      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-400">
        {summary}
      </p>

      {/* Ticker tag */}
      {ticker && (
        <span className="mb-3 inline-block rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
          ${ticker}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/[.04] pt-3 text-[11px] text-gray-500">
        <span className="font-medium">{source || "MarketMind"}</span>
        {time && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
