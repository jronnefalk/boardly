import express, { Request, Response } from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server as SocketIOServer} from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new SocketIOServer(httpServer);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
  
    socket.on('message1', (data) => {
      console.log('Received message1 event:', data);
      io.emit('message2', data);
    });
  
    socket.on('clientColumnMoved', (data) => {
      console.log('Received clientColumnMoved event:', data);
      io.emit('serverColumnMoved', data);
    });
    
    socket.on('clientCardMoved', (data) => {
      console.log('Received clientCardMoved event:', data);
      io.emit('serverCardMoved', data);
    });
    
    socket.on('clientColumnDeleted', (data) => {
      console.log('Received clientColumnDeleted event:', data);
      io.emit('serverColumnDeleted', data);
    });
    
    socket.on('clientCardDeleted', (data) => {
      console.log('Received clientCardDeleted event:', data);
      io.emit('serverCardDeleted', data);
    });

    socket.on('mouseMove', (data) => {
      io.emit('mouseMove', data); 
    });
    
    
  
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
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
