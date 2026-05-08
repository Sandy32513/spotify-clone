import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { jwtVerify } from 'jose';

const PORT = process.env.WS_PORT || 3001;
const JWT_SECRET = process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

const server = createServer();
const wss = new WebSocketServer({ server });

type Client = {
  ws: WebSocket;
  userId: string | null;
  roomId: string;
  authenticated: boolean;
};

type Room = {
  clients: Map<string, Client>;
  currentSong: string | null;
  currentPosition: number;
  isPlaying: boolean;
};

const clients = new Map<string, Client>();
const rooms = new Map<string, Room>();

function generateClientId(): string {
  return randomUUID();
}

async function verifyAuthToken(token: string): Promise<string | null> {
  if (!JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

wss.on('connection', (ws: WebSocket) => {
  const clientId = generateClientId();
  const client: Client = {
    ws,
    userId: null,
    roomId: 'default',
    authenticated: false,
  };

  clients.set(clientId, client);

  if (!rooms.has(client.roomId)) {
    rooms.set(client.roomId, {
      clients: new Map(),
      currentSong: null,
      currentPosition: 0,
      isPlaying: false,
    });
  }
  rooms.get(client.roomId)!.clients.set(clientId, client);

  console.log(`Client connected: ${clientId}`);

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data);
      void handleMessage(clientId, message);
    } catch {
      sendToClient(clientId, { type: 'error', message: 'Invalid JSON' });
    }
  });

  ws.on('close', () => {
    handleDisconnect(clientId);
  });

  ws.on('error', () => {
    handleDisconnect(clientId);
  });

  sendToClient(clientId, {
    type: 'connected',
    clientId,
    roomId: client.roomId,
  });
});

async function handleMessage(clientId: string, message: any) {
  const client = clients.get(clientId);
  if (!client) return;

  const room = rooms.get(client.roomId);
  if (!room) return;

  switch (message.type) {
    case 'join': {
      const authToken = message.authToken;
      if (!authToken) {
        sendToClient(clientId, { type: 'error', message: 'Authentication required' });
        return;
      }

      const verifiedUserId = await verifyAuthToken(authToken);
      if (!verifiedUserId) {
        sendToClient(clientId, { type: 'error', message: 'Invalid authentication token' });
        return;
      }

      // Authorization check: Users can only join their own room or public room
      const requestedRoomId = message.roomId || 'default';
      if (requestedRoomId !== 'public' && requestedRoomId !== verifiedUserId) {
        sendToClient(clientId, { type: 'error', message: 'Unauthorized to join this room' });
        return;
      }

      client.authenticated = true;
      client.userId = verifiedUserId;
      client.roomId = requestedRoomId;

      rooms.get(client.roomId)?.clients.delete(clientId);

      if (!rooms.has(client.roomId)) {
        rooms.set(client.roomId, {
          clients: new Map(),
          currentSong: null,
          currentPosition: 0,
          isPlaying: false,
        });
      }
      rooms.get(client.roomId)!.clients.set(clientId, client);

      // Get the room again after potentially changing roomId
      const updatedRoom = rooms.get(client.roomId);
      sendToClient(clientId, {
        type: 'joined',
        roomId: client.roomId,
        state: {
          currentSong: updatedRoom?.currentSong ?? null,
          currentPosition: updatedRoom?.currentPosition ?? 0,
          isPlaying: updatedRoom?.isPlaying ?? false,
        },
      });
      break;
    }

    case 'play':
      if (!client.authenticated) return;
      room.currentSong = message.songId;
      room.currentPosition = message.position || 0;
      room.isPlaying = true;
      broadcastToRoom(client.roomId, {
        type: 'play',
        songId: message.songId,
        position: room.currentPosition,
        userId: client.userId,
        timestamp: Date.now(),
      }, clientId);
      break;

    case 'pause':
      if (!client.authenticated) return;
      room.isPlaying = false;
      broadcastToRoom(client.roomId, {
        type: 'pause',
        position: message.position || room.currentPosition,
        userId: client.userId,
        timestamp: Date.now(),
      }, clientId);
      break;

    case 'seek':
      if (!client.authenticated) return;
      room.currentPosition = message.position;
      broadcastToRoom(client.roomId, {
        type: 'seek',
        position: message.position,
        userId: client.userId,
        timestamp: Date.now(),
      }, clientId);
      break;

    case 'track_change':
      if (!client.authenticated) return;
      room.currentSong = message.songId;
      room.currentPosition = 0;
      room.isPlaying = true;
      broadcastToRoom(client.roomId, {
        type: 'track_change',
        songId: message.songId,
        userId: client.userId,
        timestamp: Date.now(),
      }, clientId);
      break;

    case 'queue_update':
      if (!client.authenticated) return;
      broadcastToRoom(client.roomId, {
        type: 'queue_update',
        queue: message.queue,
        userId: client.userId,
        timestamp: Date.now(),
      }, clientId);
      break;

    default:
      break;
  }
}

function handleDisconnect(clientId: string) {
  const client = clients.get(clientId);
  if (client) {
    rooms.get(client.roomId)?.clients.delete(clientId);
    clients.delete(clientId);
  }
  console.log(`Client disconnected: ${clientId}`);
}

function sendToClient(clientId: string, message: any) {
  const client = clients.get(clientId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

function broadcastToRoom(roomId: string, message: any, excludeClientId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.clients.forEach((client, clientId) => {
    if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});

export { wss, server };
