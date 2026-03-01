"use client";

import { useState, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, TrendingUp } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function AnalysisTabInner() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
    const ticker = input.trim().toUpperCase();
    if (!ticker) return;
    setLoading(true);
    setResult("");

    try {
      const token = localStorage.getItem("jwt_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/analyze-ticker`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ticker }),
      });
      const data = await res.json();
      setResult(data.analysis || "No analysis available.");
    } catch {
      setResult("Analysis failed. Please try again.");
    }
    setLoading(false);
  }, [input]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analysis</h1>
        <p className="text-gray-400">
          AI-powered stock analysis using Gemini Pro
        </p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Enter a ticker to analyze (e.g., AAPL)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnalyze();
              }}
              aria-label="Ticker symbol input"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-colors flex items-center gap-2"
            aria-label="Analyze ticker"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze with AI"
            )}
          </button>
        </div>

        {loading && (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        )}

        {result && !loading && (
          <div className="mt-6 p-5 bg-gray-900 rounded-xl border border-gray-700">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const AnalysisTab = memo(AnalysisTabInner);
