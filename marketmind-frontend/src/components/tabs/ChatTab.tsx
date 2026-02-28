"use client";

import { useState, useCallback, useRef, memo, useEffect } from "react";
import { Loader2, Send, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ChatMessage {
  id: string;
  role: "user" | "ai" | "error";
  content: string;
  timestamp: number;
}

let messageCounter = 0;
function generateMessageId(): string {
  return `msg-${Date.now()}-${++messageCounter}`;
}

function ChatTabInner() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Hello! I'm MarketMind AI. Ask me about stocks, market trends, or investment strategies.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content: question,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("jwt_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/analyze-ticker`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ticker: question }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          role: "ai",
          content:
            data.analysis ||
            "I can help analyze specific tickers. Try asking about AAPL, GOOGL, etc.",
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          role: "error",
          content: "Sorry, I couldn't process that request. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading]);

  const getRoleStyles = (role: ChatMessage["role"]) => {
    switch (role) {
      case "user":
        return "bg-gray-700/50 rounded-xl p-4 text-white ml-8";
      case "error":
        return "bg-red-600/20 border border-red-500/30 rounded-xl p-4 text-red-200 mr-8";
      default:
        return "bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-blue-200 mr-8";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-400" />
          AI Chat
        </h1>
        <p className="text-gray-400">Ask questions about the market</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 h-[500px] flex flex-col">
        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto mb-4 space-y-3"
          role="log"
          aria-label="Chat messages"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={getRoleStyles(msg.role)}>
              <div className="prose prose-invert prose-sm max-w-none">
                {msg.role === "user" ? (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-blue-200 mr-8 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about the market..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            aria-label="Chat message input"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-colors flex items-center gap-2"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export const ChatTab = memo(ChatTabInner);
