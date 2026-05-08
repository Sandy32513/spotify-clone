'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

type WSMessage = {
  type: 'play' | 'pause' | 'seek' | 'track_change' | 'queue_update' | 'connected' | 'joined';
  data: any;
  timestamp: number;
};

type WSHandler = (message: WSMessage) => void;

export function useWebSocket(roomId: string, userId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<WSHandler>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//localhost:3001`;

    // Get current Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // Include token as query parameter for server-side validation
    const wsUrl = token ? `${wsHost}?token=${encodeURIComponent(token)}` : wsHost;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Join room with authentication
      ws.send(
        JSON.stringify({
          type: 'join',
          roomId,
          userId: userId || session?.user?.id,
          authToken: token,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        handlersRef.current.forEach((handler) => handler(message));
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting in 3s...');
      wsRef.current = null;
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [roomId, userId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const subscribe = useCallback((handler: WSHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { send, subscribe, disconnect };
}
