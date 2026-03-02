"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardTab } from "@/components/tabs/DashboardTab";
import { NewsTab } from "@/components/tabs/NewsTab";
import { PortfolioTab } from "@/components/tabs/PortfolioTab";
import { AnalysisTab } from "@/components/tabs/AnalysisTab";
import { ChatTab } from "@/components/tabs/ChatTab";

// ---------- Types ----------

interface NewsItem {
  ticker: string;
  title: string;
  summary: string;
  date: string;
  sentiment?: "bullish" | "bearish" | "neutral";
  category?: string;
  source?: string;
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
}

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

interface MarketIndexData {
  name: string;
  value: number;
  change: number;
}

// ---------- Constants ----------

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// ---------- Main Dashboard Component ----------

export default function Dashboard() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Data state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [stockData, setStockData] = useState<StockQuote[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndexData[]>([]);
  const [marketSentiment, setMarketSentiment] =
    useState<MarketSentiment | null>(null);

  // Portfolio state
  const [portfolio, setPortfolio] = useState<string[]>([]);

  // Load portfolio from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("portfolio");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setPortfolio(parsed);
      } catch {
        // Corrupted data — reset
        localStorage.removeItem("portfolio");
      }
    }
  }, []);

  // ---------- Data Fetching ----------

  const fetchQuotes = useCallback(async () => {
    const stored = localStorage.getItem("portfolio");
    const userPortfolio: string[] = stored ? JSON.parse(stored) : [];
    if (userPortfolio.length === 0) {
      setStockData([]);
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/api/quotes?tickers=${userPortfolio.join(",")}`,
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setStockData(
          data.map((q: StockQuote) => ({
            symbol: q.symbol,
            price: q.price,
            change: q.change,
          })),
        );
      }
    } catch (e) {
      console.error("Failed to fetch quotes:", e);
    }
  }, []);

  const fetchIndices = useCallback(async () => {
    try {
      const [usRes, inRes] = await Promise.all([
        fetch(`${API_URL}/api/market-indices?region=US`),
        fetch(`${API_URL}/api/market-indices?region=India`),
      ]);
      const [usData, inData] = await Promise.all([usRes.json(), inRes.json()]);
      const combined = [
        ...(Array.isArray(usData) ? usData : []),
        ...(Array.isArray(inData) ? inData : []),
      ];
      setMarketIndices(
        combined.map(
          (idx: { name: string; price: number; change: number }) => ({
            name: idx.name,
            value: idx.price,
            change: idx.change,
          }),
        ),
      );
    } catch (e) {
      console.error("Failed to fetch indices:", e);
      setMarketIndices([]);
    }
  }, []);

  const fetchSentiment = useCallback(async () => {
    try {
      const [usRes, inRes] = await Promise.all([
        fetch(`${API_URL}/api/market-sentiment?region=US`),
        fetch(`${API_URL}/api/market-sentiment?region=India`),
      ]);
      const [usData, inData] = await Promise.all([usRes.json(), inRes.json()]);
      const combined = {
        ...usData,
        summary: `${usData.summary || ""} | ${inData.summary || ""}`
          .trim()
          .replace(/^\| | \|$/g, ""),
      };
      if (combined.sentimentLabel) setMarketSentiment(combined);
    } catch (e) {
      console.error("Failed to fetch sentiment:", e);
    }
  }, []);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt_token");
      const res = token
        ? await fetch(`${API_URL}/api/news`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await fetch(`${API_URL}/api/market-news`);

      const data = await res.json();

      // /api/market-news returns { summary, articles[], updated }
      if (
        data.articles &&
        Array.isArray(data.articles) &&
        data.articles.length > 0
      ) {
        setNews(
          data.articles.map((item: NewsItem) => ({
            ticker: item.ticker || "MARKET",
            title: item.title,
            summary: item.summary,
            date: item.date || new Date().toISOString(),
            sentiment:
              (item.sentiment?.toLowerCase() as
                | "bullish"
                | "bearish"
                | "neutral") || "neutral",
            category: item.category || "General",
            source: item.source || "MarketMind AI",
          })),
        );
      } else if (data.summary && !Array.isArray(data)) {
        // Fallback: summary-only response
        setNews([
          {
            ticker: "MARKET",
            title: "Today's Market Summary",
            summary: data.summary,
            date: new Date().toISOString(),
            sentiment: "neutral",
            category: "General",
            source: "MarketMind AI",
          },
        ]);
      } else if (Array.isArray(data)) {
        // /api/news returns array directly
        setNews(
          data.map((item: NewsItem) => ({
            ticker: item.ticker,
            title: item.title,
            summary: item.summary,
            date: item.date,
            sentiment:
              (item.sentiment?.toLowerCase() as
                | "bullish"
                | "bearish"
                | "neutral") || "neutral",
            category: item.category || "General",
            source: item.source || "MarketMind AI",
          })),
        );
      }
    } catch (e) {
      console.error("Failed to fetch news:", e);
    }
    setLoading(false);
    setLastUpdated(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
  }, []);

  // ---------- Portfolio Management ----------

  const handleAddTicker = useCallback((ticker: string) => {
    setPortfolio((prev) => {
      if (prev.includes(ticker)) return prev;
      const updated = [...prev, ticker];
      localStorage.setItem("portfolio", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleRemoveTicker = useCallback((ticker: string) => {
    setPortfolio((prev) => {
      const updated = prev.filter((t) => t !== ticker);
      localStorage.setItem("portfolio", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ---------- Effects ----------

  useEffect(() => {
    fetchNews();
    fetchQuotes();
    fetchIndices();
    fetchSentiment();

    // Refresh quotes, indices, sentiment every 60s
    const fastInterval = setInterval(() => {
      fetchQuotes();
      fetchIndices();
      fetchSentiment();
    }, 60000);

    // Refresh news every 14 min (also keeps Render backend alive)
    const keepAliveInterval = setInterval(
      () => {
        fetchNews();
      },
      14 * 60 * 1000,
    );

    return () => {
      clearInterval(fastInterval);
      clearInterval(keepAliveInterval);
    };
  }, [fetchNews, fetchQuotes, fetchIndices, fetchSentiment]);

  // ---------- Render ----------

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            stockData={stockData}
            marketIndices={marketIndices}
            marketSentiment={marketSentiment}
            news={news}
            loading={loading}
            portfolio={portfolio}
          />
        );
      case "news":
        return <NewsTab news={news} loading={loading} />;
      case "portfolio":
        return (
          <PortfolioTab
            portfolio={portfolio}
            onAddTicker={handleAddTicker}
            onRemoveTicker={handleRemoveTicker}
          />
        );
      case "analysis":
        return <AnalysisTab />;
      case "chat":
        return <ChatTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Header onRefresh={fetchNews} lastUpdated={lastUpdated} />
      <main className="ml-56 pt-14 p-6">
        <ErrorBoundary>{renderActiveTab()}</ErrorBoundary>
      </main>
    </div>
  );
}
