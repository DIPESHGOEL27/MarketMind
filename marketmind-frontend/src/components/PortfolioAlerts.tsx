"use client";

import { useEffect, useState, memo } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

        // Find biggest movers
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

        // Alert for any stock down > 2%
        data.forEach((stock: { symbol: string; change: number }) => {
          if (stock.change < -2) {
            generated.push({
              id: `drop-${stock.symbol}`,
              type: "volume",
              message: `${stock.symbol} dropped ${Math.abs(stock.change).toFixed(2)}% — review your position`,
              time: "Just now",
            });
          }
        });

        // Add portfolio summary
        const avgChange =
          data.reduce(
            (sum: number, s: { change: number }) => sum + s.change,
            0,
          ) / data.length;
        generated.push({
          id: "portfolio-avg",
          type: avgChange >= 0 ? "movers" : "volume",
          message: `Portfolio average: ${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}% across ${data.length} stocks`,
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
    // Refresh alerts every 2 minutes
    const interval = setInterval(generateAlerts, 120000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "movers":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "volume":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-5">
      <h3 className="text-lg font-bold text-white mb-4">Portfolio Alerts</h3>
      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading alerts...
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Portfolio alerts">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all"
              role="listitem"
            >
              <div className="mt-0.5">{getIcon(alert.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const PortfolioAlerts = memo(PortfolioAlertsInner);
