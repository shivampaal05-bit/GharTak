import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface Subscription {
  ws: WebSocket;
  channel: string;
  userId?: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private subscriptions: Set<Subscription> = new Set();

  init(server: http.Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      // Parse query parameters from req.url
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      const token = url.searchParams.get('token');
      let userId: string | undefined;

      if (token) {
        try {
          const payload = jwt.verify(token, config.jwtSecret) as any;
          userId = payload.id;
        } catch {
          // Public viewers can subscribe to view tokens without full JWT
        }
      }

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          // { action: 'subscribe', channel: 'share:123' | 'sos:456' }
          if (data.action === 'subscribe' && data.channel) {
            this.subscriptions.add({ ws, channel: data.channel, userId });
            ws.send(JSON.stringify({ event: 'subscribed', channel: data.channel }));
          } else if (data.action === 'unsubscribe' && data.channel) {
            this.subscriptions.forEach((sub) => {
              if (sub.ws === ws && sub.channel === data.channel) {
                this.subscriptions.delete(sub);
              }
            });
          }
        } catch (e) {
          // Ignore malformed messages
        }
      });

      ws.on('close', () => {
        this.subscriptions.forEach((sub) => {
          if (sub.ws === ws) {
            this.subscriptions.delete(sub);
          }
        });
      });
    });
  }

  broadcast(channel: string, event: string, payload: any) {
    const message = JSON.stringify({ event, channel, data: payload, timestamp: new Date().toISOString() });
    this.subscriptions.forEach((sub) => {
      if (sub.channel === channel && sub.ws.readyState === WebSocket.OPEN) {
        sub.ws.send(message);
      }
    });
  }
}

export const wsManager = new WebSocketManager();
