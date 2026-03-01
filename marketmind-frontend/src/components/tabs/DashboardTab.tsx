"use client";

import { memo } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertCircle,
  Newspaper,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketNews } from "@/components/MarketNews";
import { PortfolioAlerts } from "@/components/PortfolioAlerts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sentimentColor(label: string) {
  const l = label.toLowerCase();
  if (l === "bullish") return "text-emerald-400";
  if (l === "bearish") return "text-red-400";
  return "text-amber-400";
}

function sentimentBg(label: string) {
  const l = label.toLowerCase();
  if (l === "bullish") return "from-emerald-500/20 to-emerald-500/5";
  if (l === "bearish") return "from-red-500/20 to-red-500/5";
  return "from-amber-500/20 to-amber-500/5";
}

function sentimentDot(label: string) {
  const l = label.toLowerCase();
  if (l === "bullish")
    return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.6)]";
  if (l === "bearish")
    return "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,.6)]";
  return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,.6)]";
}

function changeColor(change: number) {
  return change >= 0 ? "text-emerald-400" : "text-red-400";
}

function changeBg(change: number) {
  return change >= 0
    ? "bg-emerald-500/10 border-emerald-500/20"
    : "bg-red-500/10 border-red-500/20";
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SentimentBanner({ sentiment }: { sentiment: MarketSentiment }) {
  const score = Math.round(sentiment.sentimentScore * 100);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[.06] bg-gradient-to-r ${sentimentBg(sentiment.sentimentLabel)} p-5 backdrop-blur-xl`}
    >
      {/* Decorative gradient orb */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[.06] backdrop-blur-sm">
          <Sparkles className="h-6 w-6 text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              AI Market Sentiment
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${changeBg(sentiment.sentimentScore - 0.5)} ${sentimentColor(sentiment.sentimentLabel)}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${sentimentDot(sentiment.sentimentLabel)}`}
              />
              {sentiment.sentimentLabel} &middot; {score}%
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            {sentiment.summary}
          </p>
        </div>
      </div>
    </div>
  );
}

function IndexCard({ index }: { index: MarketIndexData }) {
  const positive = index.change >= 0;
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[.06] bg-white/[.02] p-4 transition-all hover:border-white/[.12] hover:bg-white/[.04]">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-400">
            {index.name}
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-white">
            {index.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${positive ? "bg-emerald-500/10" : "bg-red-500/10"}`}
        >
          {positive ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-400" />
          )}
        </div>
      </div>
      <p
        className={`mt-2 text-sm font-semibold tabular-nums ${changeColor(index.change)}`}
      >
        {positive ? "+" : ""}
        {index.change.toFixed(2)}%
      </p>
    </div>
  );
}

function StockPill({ stock }: { stock: StockQuote }) {
  const positive = stock.change >= 0;
  return (
    <div className="flex min-w-[160px] items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.02] px-4 py-3 transition-all hover:border-white/[.12] hover:bg-white/[.04]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400">
        {stock.symbol.slice(0, 3)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{stock.symbol}</p>
        <p className="text-xs tabular-nums text-gray-400">
          ${stock.price.toFixed(2)}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-0.5 rounded-md border px-2 py-0.5 text-xs font-bold tabular-nums ${changeBg(stock.change)} ${changeColor(stock.change)}`}
      >
        {positive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {positive ? "+" : ""}
        {stock.change.toFixed(2)}%
      </span>
    </div>
  );
}

function LiveUpdateCard({ update }: { update: LiveUpdate }) {
  return (
    <a
      href={update.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-white/[.06] hover:bg-white/[.02]"
    >
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/10">
        <Zap className="h-3.5 w-3.5 text-red-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-gray-200 group-hover:text-white">
          {update.headline}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
          <span className="font-medium">{update.source}</span>
          <span>&middot;</span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {update.time}
          </span>
        </div>
      </div>
      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

function NewsCompactCard({ item }: { item: NewsItem }) {
  const sentStyles = {
    bullish: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bearish: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <div className="group rounded-xl border border-white/[.06] bg-white/[.02] p-4 transition-all hover:border-white/[.12] hover:bg-white/[.04]">
      <div className="mb-2 flex items-center gap-2">
        {item.sentiment && (
          <span
            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${sentStyles[item.sentiment]}`}
          >
            {item.sentiment}
          </span>
        )}
        {item.category && (
          <span className="rounded-md bg-white/[.04] px-2 py-0.5 text-[10px] text-gray-400">
            {item.category}
          </span>
        )}
        {item.ticker && item.ticker !== "MARKET" && (
          <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
            ${item.ticker}
          </span>
        )}
      </div>
      <h4 className="mb-1 text-sm font-semibold leading-snug text-white">
        {item.title}
      </h4>
      <p className="line-clamp-2 text-xs leading-relaxed text-gray-400">
        {item.summary}
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-white/[.04] pt-2 text-[11px] text-gray-500">
        <span className="font-medium">{item.source || "MarketMind AI"}</span>
        {item.date && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(item.date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton Loaders                                                   */
/* ------------------------------------------------------------------ */

function IndexSkeleton() {
  return (
    <div className="rounded-xl border border-white/[.06] bg-white/[.02] p-4">
      <Skeleton className="mb-2 h-3 w-16 bg-white/[.06]" />
      <Skeleton className="mb-2 h-6 w-28 bg-white/[.06]" />
      <Skeleton className="h-4 w-14 bg-white/[.06]" />
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="rounded-xl border border-white/[.06] bg-white/[.02] p-4">
      <Skeleton className="mb-2 h-3 w-24 bg-white/[.06]" />
      <Skeleton className="mb-1 h-4 w-3/4 bg-white/[.06]" />
      <Skeleton className="h-3 w-full bg-white/[.06]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

function DashboardTabInner({
  stockData,
  marketIndices,
  marketSentiment,
  news,
  loading,
}: DashboardTabProps) {
  const hasIndices = marketIndices.length > 0;
  const hasStocks = stockData.length > 0;
  const hasNews = news.length > 0;
  const hasLiveUpdates =
    marketSentiment?.liveUpdates && marketSentiment.liveUpdates.length > 0;

  return (
    <div className="space-y-6">
      {/* ---- Header Row ---- */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Real-time market overview &amp; portfolio tracking
        </p>
      </div>

      {/* ---- AI Sentiment Banner ---- */}
      {marketSentiment && <SentimentBanner sentiment={marketSentiment} />}

      {/* ---- Portfolio Stocks Ribbon ---- */}
      {hasStocks && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Your Portfolio
            </h2>
          </div>
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            role="list"
            aria-label="Portfolio stocks"
          >
            {stockData.map((s) => (
              <StockPill key={s.symbol} stock={s} />
            ))}
          </div>
        </section>
      )}

      {/* ---- Market Indices Grid ---- */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-purple-400" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Market Indices
          </h2>
        </div>
        {loading && !hasIndices ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <IndexSkeleton key={i} />
            ))}
          </div>
        ) : hasIndices ? (
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            role="list"
            aria-label="Market indices"
          >
            {marketIndices.map((idx) => (
              <IndexCard key={idx.name} index={idx} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.02] px-5 py-8">
            <AlertCircle className="h-5 w-5 shrink-0 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-300">
                Market indices unavailable
              </p>
              <p className="text-xs text-gray-500">
                Unable to fetch live data. The backend API may be starting
                up&mdash;try refreshing in a moment.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ---- 3-Column Content Grid ---- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 cols — News + Live Updates */}
        <div className="space-y-6 lg:col-span-2">
          {/* Live Updates */}
          {hasLiveUpdates && (
            <section className="rounded-2xl border border-white/[.06] bg-white/[.02] p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Live Updates
                </h2>
              </div>
              <div className="space-y-1">
                {marketSentiment!.liveUpdates.slice(0, 5).map((u, i) => (
                  <LiveUpdateCard key={`${u.url}-${i}`} update={u} />
                ))}
              </div>
            </section>
          )}

          {/* Market News */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-indigo-400" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Market News
              </h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <NewsSkeleton key={n} />
                ))}
              </div>
            ) : hasNews ? (
              <div className="space-y-3">
                {news.slice(0, 4).map((item, i) => (
                  <NewsCompactCard
                    key={`${item.ticker}-${item.title}-${i}`}
                    item={item}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/[.08] bg-white/[.01] py-12 text-center">
                <Newspaper className="h-8 w-8 text-gray-600" />
                <p className="text-sm text-gray-400">No news available</p>
                <p className="text-xs text-gray-500">
                  Add tickers to your portfolio or check back later
                </p>
              </div>
            )}
          </section>

          {/* AI Market Brief */}
          <MarketNews />
        </div>

        {/* Right column — Portfolio Alerts */}
        <div className="space-y-6">
          <PortfolioAlerts />
        </div>
      </div>
    </div>
  );
}

export const DashboardTab = memo(DashboardTabInner);
