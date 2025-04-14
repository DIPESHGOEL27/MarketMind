// File: src/pages/api/summarize.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Missing article text" });
  }

  const prompt = `Summarize the following article and determine its sentiment (Positive, Negative, or Neutral):\n\n"${text}"\n\nRespond with a JSON like: {"summary": "...", "sentiment": "Positive"}`;

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;

    try {
      const parsed = JSON.parse(content);
      return res.status(200).json(parsed);
    } catch (jsonErr) {
      console.warn("⚠️ Failed to parse GPT response as JSON:", content);
      return res.status(200).json({
        summary: text.slice(0, 300) + "...",
        sentiment: "Neutral",
      });
    }
  } catch (err: any) {
    console.error("❌ OpenAI error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Failed to summarize article. Possibly due to quota limits.",
    });
  }
}
