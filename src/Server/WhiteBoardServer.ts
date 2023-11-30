import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { PortsGlobal, RENDER_REDIS_URL } from '../ServerDataDefinitions';

// connnect to socket.io
const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {serveClient: false, cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const redisURL = `${RENDER_REDIS_URL}:${PortsGlobal.redisPort}`;

// connnect to redis
const redis = new Redis(redisURL, {
    // This is the default value of `retryStrategy`
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
});
const drawingsList = 'drawings';

redis.del(drawingsList);


io.on('connection', (socket) => {
   

    socket.on('getDrawings', () => {
        redis.lrange(drawingsList, 0, -1).then(drawings => {
            drawings.forEach(drawing => {
              socket.emit('drawing', JSON.parse(drawing)); 
            });
        });
    });
    
    socket.on('drawing', (drawing) => {
        redis.lpush(drawingsList, JSON.stringify(drawing));
        socket.broadcast.emit('drawing', drawing);
    });

    socket.on('clear', () => {
        redis.del(drawingsList);
        socket.broadcast.emit('clear');
    });

});

server.listen(PortsGlobal.whiteboardServerPort, () => {
    console.log(`whiteboard server listening on *:${PortsGlobal.whiteboardServerPort}`);
});