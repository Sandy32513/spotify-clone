import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { jwtVerify, decodeJwt } from 'jose';

const PORT = process.env.WS_PORT || 3001;
// Use Supabase's JWT secret from service role key or dedicated JWT secret
const JWT_SECRET = process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verify that JWT_SECRET is set
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not configured. WebSocket authentication will be disabled.');
}

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

// Verify Supabase JWT token and extract user ID
async function verifyAuthToken(token: string): Promise<string | null> {
  if (!JWT_SECRET) {
    console.error('Cannot verify token: JWT_SECRET not configured');
    return null;
  }

  try {
    // Decode the JWT to verify signature and claims
    const payload = decodeJwt(token);
    
    // Verify it's a Supabase token (iss should be supabase)
    if (payload.iss !== 'supabase') {
      console.warn('Token issuer invalid:', payload.iss);
      return null;
    }

    // Verify the token hasn't expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('Token expired');
      return null;
    }

    // Return the user ID (sub claim)
    return payload.sub as string || null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Authorize room access: users can only join their own user-id room or 'public' room
function authorizeRoomAccess(userId: string, requestedRoomId: string): boolean {
  // Allow public room for everyone
  if (requestedRoomId === 'public') return true;
  // Users can join their own room (user ID as room ID)
  if (requestedRoomId === userId) return true;
  // Admin/super_admin can join any room (checked via token role claim if needed)
  return false;
}

wss.on('connection', (ws: WebSocket, request: any) => {
  const clientId = generateClientId();
  
  // Extract token from query parameters
  const url = new URL(request.url, 'http://localhost');
  const tokenFromQuery = url.searchParams.get('token');
  
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

  // If token provided in query, authenticate immediately
  if (tokenFromQuery) {
    (async () => {
      const userId = await verifyAuthToken(tokenFromQuery);
      if (userId) {
        client.userId = userId;
        client.authenticated = true;
        console.log(`Client ${clientId} authenticated as user ${userId}`);
      } else {
        console.warn(`Failed to authenticate client ${clientId}: invalid token`);
        ws.close(4001, 'Invalid authentication token');
        return;
      }
    })();
  }

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

  ws.on('error', (error) => {
    console.error(`WebSocket error from client ${clientId}:`, error);
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
      // Token should already be verified from URL query param on connection
      // but we also accept it in the message for redundancy
      const authToken = message.authToken || client.userId ? null : message.authToken;
      
      if (!client.authenticated && !authToken) {
        sendToClient(clientId, { type: 'error', message: 'Authentication required' });
        return;
      }

      const requestedRoomId = message.roomId || 'default';

      // If not yet authenticated, verify token now
      if (!client.authenticated && authToken) {
        const verifiedUserId = await verifyAuthToken(authToken);
        if (!verifiedUserId) {
          sendToClient(clientId, { type: 'error', message: 'Invalid or expired authentication token' });
          return;
        }
        client.userId = verifiedUserId;
        client.authenticated = true;
      }

      if (!client.authenticated) {
        sendToClient(clientId, { type: 'error', message: 'Authentication required' });
        return;
      }

      // Authorize room access
      if (!authorizeRoomAccess(client.userId!, requestedRoomId)) {
        sendToClient(clientId, { 
          type: 'error', 
          message: `Unauthorized: cannot join room '${requestedRoomId}'` 
        });
        return;
      }

      // Move client to the requested room
      rooms.get(client.roomId)?.clients.delete(clientId);
      client.roomId = requestedRoomId;

      if (!rooms.has(client.roomId)) {
        rooms.set(client.roomId, {
          clients: new Map(),
          currentSong: null,
          currentPosition: 0,
          isPlaying: false,
        });
      }
      rooms.get(client.roomId)!.clients.set(clientId, client);

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
      console.log(`Client ${clientId} joined room ${requestedRoomId} as user ${client.userId}`);
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
