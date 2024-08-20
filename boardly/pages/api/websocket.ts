import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer } from 'ws';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any;
    wss?: WebSocketServer;
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.wss) {
    console.log('Setting up WebSocket server');

    // Create a new WebSocket server and attach it to the existing HTTP server
    const wss = new WebSocketServer({ server: res.socket.server });

    wss.on('connection', (ws) => {
      console.log('New client connected');

      ws.on('message', (message) => {
        console.log('Received:', message);

        // Broadcast the message to all other connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(message);
          }
        });
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.wss = wss;
  } else {
    console.log('WebSocket server already set up');
  }

  res.end();
}
