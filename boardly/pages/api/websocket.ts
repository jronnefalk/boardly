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

    const wss = new WebSocketServer({ server: res.socket.server });

    wss.on('connection', (ws) => {
      console.log('New client connected');

      ws.on('message', (message) => {
        console.log('Received:', message);

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
