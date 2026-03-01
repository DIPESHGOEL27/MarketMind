"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface StockCardProps {
  symbol: string;
  price: number;
  change: number;
}

export function StockCard({ symbol, price, change }: StockCardProps) {
  const positive = change >= 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[.06] bg-white/[.02] p-4 min-w-[150px] transition-all hover:border-white/[.12] hover:bg-white/[.04]">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {symbol}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums text-white">
        ${price.toFixed(2)}
      </p>
      <div
        className={`mt-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold tabular-nums ${
          positive
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}
      >
        {positive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {positive ? "+" : ""}
        {change.toFixed(2)}%
      </div>
    </div>
  );
}

interface MarketIndexProps {
  name: string;
  value: number;
  change: number;
}

export function MarketIndex({ name, value, change }: MarketIndexProps) {
  const positive = change >= 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[.06] bg-white/[.02] p-4 flex-1 transition-all hover:border-white/[.12] hover:bg-white/[.04]">
      <div className="flex justify-between items-start">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {name}
        </p>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${positive ? "bg-emerald-500/10" : "bg-red-500/10"}`}
        >
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          )}
        </div>
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums text-white">
        {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </p>
      <p
        className={`mt-1 text-sm font-semibold tabular-nums ${positive ? "text-emerald-400" : "text-red-400"}`}
      >
        {positive ? "+" : ""}
        {change.toFixed(2)}%
      </p>
    </div>
  );
}
