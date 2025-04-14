// File: src/pages/api/news.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const NEWS_API_URL = "https://newsapi.org/v2/everything";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query.q as string;

  console.log("🔍 API route hit with query:", query);

  if (!query) {
    return res.status(400).json({ message: "Missing stock ticker query." });
  }

  try {
    console.log("📡 Making request to NewsAPI...");
    const newsRes = await axios.get(NEWS_API_URL, {
      params: {
        q: query,
        language: "en",
        pageSize: 5,
        sortBy: "publishedAt",
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    console.log(
      "✅ NewsAPI responded with",
      newsRes.data.articles.length,
      "articles"
    );

    const articles = newsRes.data.articles.map((article: any) => ({
      title: article.title,
      url: article.url,
      source: article.source?.name || "Unknown",
      publishedAt: article.publishedAt,
      summary: article.description || "", // initial fallback summary
    }));

    return res.status(200).json({ articles });
  } catch (err: any) {
    console.error("❌ Error making request to NewsAPI:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    }
    return res.status(500).json({ message: "Failed to fetch news." });
  }
}
