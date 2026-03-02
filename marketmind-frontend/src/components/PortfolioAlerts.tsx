"use client";

import { useEffect, useState, memo } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
  ShieldAlert,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Alert {
  id: string;
  type: "movers" | "volume" | "info";
  message: string;
  time: string;
}

function PortfolioAlertsInner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateAlerts = async () => {
      const stored = localStorage.getItem("portfolio");
      const portfolio: string[] = stored ? JSON.parse(stored) : [];

      if (portfolio.length === 0) {
        setAlerts([
          {
            id: "empty",
            type: "info",
            message: "Add tickers to your portfolio to see alerts here.",
            time: "now",
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/quotes?tickers=${portfolio.join(",")}`,
        );
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setAlerts([
            {
              id: "no-data",
              type: "info",
              message: "No quote data available.",
              time: "now",
            },
          ]);
          setLoading(false);
          return;
        }

        const generated: Alert[] = [];

        const sorted = [...data].sort(
          (a, b) => Math.abs(b.change) - Math.abs(a.change),
        );
        const topMover = sorted[0];
        if (topMover && Math.abs(topMover.change) > 0) {
          const direction = topMover.change > 0 ? "up" : "down";
          generated.push({
            id: `mover-${topMover.symbol}`,
            type: "movers",
            message: `${topMover.symbol} is ${direction} ${Math.abs(topMover.change).toFixed(2)}% today`,
            time: "Just now",
          });
        }

        data.forEach((stock: { symbol: string; change: number }) => {
          if (stock.change < -2) {
            generated.push({
              id: `drop-${stock.symbol}`,
              type: "volume",
              message: `${stock.symbol} dropped ${Math.abs(stock.change).toFixed(2)}% — review position`,
              time: "Just now",
            });
          }
        });

        const avgChange =
          data.reduce(
            (sum: number, s: { change: number }) => sum + s.change,
            0,
          ) / data.length;
        generated.push({
          id: "portfolio-avg",
          type: avgChange >= 0 ? "movers" : "volume",
          message: `Portfolio avg: ${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}% across ${data.length} stocks`,
          time: "Just now",
        });

        setAlerts(
          generated.length > 0
            ? generated
            : [
                {
                  id: "calm",
                  type: "info",
                  message: "Markets are calm. No notable alerts.",
                  time: "now",
                },
              ],
        );
      } catch {
        setAlerts([
          {
            id: "error",
            type: "info",
            message: "Could not load portfolio alerts.",
            time: "now",
          },
        ]);
      }
      setLoading(false);
    };

    generateAlerts();
    const interval = setInterval(generateAlerts, 120000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "movers":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
        );
      case "volume":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          </div>
        );
      default:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Portfolio Alerts
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm">Loading alerts...</span>
        </div>
      ) : (
        <div className="space-y-2" role="list" aria-label="Portfolio alerts">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-xl border border-white/[.04] bg-white/[.02] p-3 transition-all hover:border-white/[.08]"
              role="listitem"
            >
              <div className="mt-0.5 shrink-0">{getIcon(alert.type)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-200">{alert.message}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const PortfolioAlerts = memo(PortfolioAlertsInner);
