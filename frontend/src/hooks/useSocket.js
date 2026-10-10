import { useEffect, useRef, useState } from 'react';
import { useAlertStore } from '../store/useAlertStore';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const handleRealtimeAlert = useAlertStore((state) => state.handleRealtimeAlert);

  useEffect(() => {
    const connect = () => {
      // Protocol dynamic based on current host or environment variable
      let wsUrl;
      if (import.meta.env.VITE_WS_URL) {
        wsUrl = `${import.meta.env.VITE_WS_URL.replace(/\/$/, '')}/ws/alerts`;
      } else if (import.meta.env.VITE_API_URL) {
        try {
          const parsed = new URL(import.meta.env.VITE_API_URL);
          const proto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
          wsUrl = `${proto}//${parsed.host}/ws/alerts`;
        } catch {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          wsUrl = `${protocol}//${window.location.host}/ws/alerts`;
        }
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}/ws/alerts`;
      }

      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event && data.event !== 'pong') {
              handleRealtimeAlert(data);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          // Try reconnecting in 4 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 4000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        setConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };

    connect();

    // Ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send('ping');
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [handleRealtimeAlert]);

  return { connected };
};
