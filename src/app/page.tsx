// File: src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import axios from 'axios';

interface NewsArticle {
  title: string;
  summary?: string;
  url: string;
  sentiment?: string;
  source?: string;
  publishedAt: string;
}

interface TickerOption {
  symbol: string;
  name: string;
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [query, setQuery] = useState('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tickers, setTickers] = useState<TickerOption[]>([]);
  const [filteredTickers, setFilteredTickers] = useState<TickerOption[]>([]);

  const fetchTickers = async () => {
    try {
      const res = await axios.get('/tickers.json');
      setTickers(res.data);
    } catch (err) {
      console.error('Failed to fetch tickers.');
    }
  };

  const fetchNews = async (customQuery?: string) => {
    setLoading(true);
    setError('');
    try {
      const searchQuery = customQuery || query || 'stock market';
      const res = await axios.get(`/api/news?q=${searchQuery}`);
      setNews(res.data.articles);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching news');
    }
    setLoading(false);
  };

  const summarizeArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const summaries = await Promise.all(
        news.map(async (article) => {
          try {
            const res = await axios.post('/api/summarize', {
              text: article.title + '. ' + (article.summary || '')
            });
            return {
              ...article,
              summary: res.data.summary,
              sentiment: res.data.sentiment,
            };
          } catch {
            return article;
          }
        })
      );
      setNews(summaries);
    } catch (err: any) {
      setError('Failed to re-summarize articles.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    fetchTickers();
  }, []);

  useEffect(() => {
    if (!query.trim()) return setFilteredTickers([]);
    const filtered = tickers.filter((t) =>
      t.symbol.toLowerCase().includes(query.toLowerCase()) ||
      t.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    setFilteredTickers(filtered);
  }, [query, tickers]);

  return (
    <div className={darkMode ? 'bg-gray-900 text-white min-h-screen' : 'bg-white text-black min-h-screen'}>
      <div className="p-4 flex justify-between items-center">
      <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
        MarketMind – AI Stock & News Companion
      </h1>
        <div className="flex gap-2 items-center">
          <Sun />
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          <Moon />
        </div>
      </div>

      <div className="p-4 flex gap-2 items-center flex-wrap relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter stock ticker (e.g., AAPL)"
          className="w-64 rounded-xl border border-gray-300"
        />
        <Button onClick={() => fetchNews()} className="rounded-xl px-6 py-2 font-semibold">Search</Button>
        <Button variant="outline" onClick={summarizeArticles}>
          Summarize Sentiment
        </Button>

        {filteredTickers.length > 0 && (
          <div className={`absolute top-full mt-1 w-64 rounded shadow z-10 border ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}>
            {filteredTickers.map((ticker) => (
              <div
                key={ticker.symbol}
                className={`px-3 py-2 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                onClick={() => {
                  setQuery(ticker.symbol);
                  setFilteredTickers([]);
                  fetchNews(ticker.symbol);
                }}
              >
                {ticker.symbol} - {ticker.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <p className="p-4">Loading...</p>}
      {error && <p className="p-4 text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {news.map((article, i) => (
          <Card
            key={i}
            className={`transition duration-300 transform hover:scale-[1.02] ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          >
            <CardContent>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <h2 className="font-semibold text-lg hover:underline">{article.title}</h2>
              </a>
              <p className="text-sm mt-2">
                {article.summary || 'No summary available. Click "Summarize Sentiment" to generate one.'}
              </p>
              {article.sentiment && (
                <p
                  className={`mt-2 font-medium ${
                    article.sentiment === 'Positive'
                      ? 'text-green-400'
                      : article.sentiment === 'Negative'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}
                >
                  Sentiment: {article.sentiment}
                </p>
              )}
              <p className="text-xs mt-2 text-gray-400">
                {article.source || 'Unknown source'} • {new Date(article.publishedAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
