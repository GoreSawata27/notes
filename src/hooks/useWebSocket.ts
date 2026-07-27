"use client";
import { useEffect, useRef, useState } from "react";

interface WSMessage {
  type?: string;
  data?: any;
  [key: string]: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useWebSocket(url: string, token: string | null, onMessage: (msg: WSMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "open" | "closed">("idle");
  const retryDelayRef = useRef(1000);
  const reconnectTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!token) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setStatus("idle");
      return;
    }

    const fullUrl = `wss://${API_URL}/ws/${url}/?token=${token}`;

    function connect() {
      if (!token || !isMountedRef.current) return;

      setStatus("connecting");
      const ws = new WebSocket(fullUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setStatus("open");
        retryDelayRef.current = 1000;
      };

      ws.onmessage = (ev) => {
        if (!isMountedRef.current) return;
        try {
          const parsed: WSMessage = JSON.parse(ev.data);
          onMessage(parsed);
        } catch (err) {
          console.error("Failed to parse WS message:", err, ev.data);
        }
      };

      ws.onerror = (e) => {
        console.error("WS error", e);
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;

        setStatus("closed");
        wsRef.current = null;

        if (!token) {
          console.log("WS closed, no token - not reconnecting");
          return;
        }

        const delay = retryDelayRef.current;
        retryDelayRef.current = Math.min(delay * 2, 30000);

        console.warn(`WS closed (code: ${event.code}), retrying in ${delay}ms…`);
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      isMountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setStatus("idle");
      retryDelayRef.current = 1000;
    };
  }, [url, token]);

  return { status };
}
