import { useEffect, useState, useRef, useCallback } from "react";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

/** Calculate exponential backoff with jitter */
function getBackoffDelay(attempt: number): number {
  const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
  // Add ±25% jitter to prevent thundering herd
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

interface UseWebSocketReturn<T> {
  data: T[];
  error: string | null;
  isConnected: boolean;
  retryCount: number;
}

export function useWebSocket<T>(
  url: string,
  token: string,
): UseWebSocketReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (!token || unmountedRef.current) return;

    // Resolve WebSocket URL:
    // 1. Explicit url prop or NEXT_PUBLIC_WS_URL env var
    // 2. Derive from NEXT_PUBLIC_API_URL (http→ws, https→wss)
    // 3. Fall back to relative (same-origin) ws
    let wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || "";
    if (!wsUrl) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (apiUrl) {
        wsUrl = apiUrl.replace(/^http/, "ws") + "/ws";
      } else if (typeof window !== "undefined") {
        const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
        wsUrl = `${proto}//${window.location.host}/ws`;
      } else {
        wsUrl = "ws://localhost:8080/ws";
      }
    }
    const fullUrl = `${wsUrl}?token=${token}`;

    try {
      const socket = new WebSocket(fullUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (unmountedRef.current) {
          socket.close();
          return;
        }
        setError(null);
        setIsConnected(true);
        attemptRef.current = 0;
        setRetryCount(0);
      };

      socket.onclose = (event) => {
        if (unmountedRef.current) return;
        setIsConnected(false);

        // Only reconnect on unexpected close
        if (!event.wasClean && attemptRef.current < MAX_RETRIES) {
          const delay = getBackoffDelay(attemptRef.current);
          setError(
            `Connection lost. Reconnecting in ${Math.round(delay / 1000)}s... (attempt ${attemptRef.current + 1}/${MAX_RETRIES})`,
          );
          retryTimerRef.current = setTimeout(() => {
            attemptRef.current += 1;
            setRetryCount(attemptRef.current);
            connect();
          }, delay);
        } else if (attemptRef.current >= MAX_RETRIES) {
          setError(
            "Unable to connect after multiple attempts. Please refresh the page.",
          );
        }
      };

      socket.onerror = () => {
        // Error details are intentionally limited by browser security.
        // The onclose handler manages reconnection.
        if (!unmountedRef.current) {
          setError("WebSocket connection error");
        }
      };

      socket.onmessage = (event) => {
        try {
          const incoming = JSON.parse(event.data);
          const items: T[] = Array.isArray(incoming) ? incoming : [incoming];
          setData((prev) => [...items, ...prev]);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError("Failed to establish WebSocket connection");
    }
  }, [url, token]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (socketRef.current) {
        socketRef.current.onclose = null; // Prevent reconnect on intentional close
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { data, error, isConnected, retryCount };
}
