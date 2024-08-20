import express, { Request, Response } from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new SocketIOServer(httpServer);

  io.on('connection', (socket: Socket) => {
    console.log('Client connected');

    socket.on('message1', (data: any) => {
      console.log('Received from client:', data);
      io.emit('message2', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
