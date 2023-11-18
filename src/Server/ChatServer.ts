import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { PortsGlobal } from '../ServerDataDefinitions';

interface MessageProp {
    user: string,
    msg: string
    timestamp: string
}



const app = express();
const server = http.createServer(app);
const io = new Server(server, {serveClient: false, cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// const redis = new Redis(); // connect to 127.0.0.1:6379

const redis = new Redis({
    // This is the default value of `retryStrategy`
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
});

io.on('connection', (socket) => {

    let sub: Redis| null = new Redis();
    let pub: Redis| null = new Redis();

    let startId: string;
    let reachEnd: boolean = false;
    // send 20 history messages by default
    sendHistoryMessage();

    // -------------------- Sign In -------------------- //
    socket.on('sign_in', async (userName: string) => {
        const currentUser = await getUsernameBySocketId(socket.id);
        if (currentUser !== null && currentUser !== userName) {
            await redis.hdel("user-socket-map", currentUser);
            console.log(`user ${currentUser} disconnected`);
        }
        const exists = await redis.hexists("user-socket-map", userName);
        if (exists === 1) {
            socket.emit('sign_in_response', {user: userName, status: 404});
        } else {
            await redis.hset("user-socket-map", userName, socket.id);
            socket.emit('sign_in_response', {user: userName, status: 200});
            console.log(`user ${userName} connected: ${socket.id}}`);
        }
        
    });

    // -------------------- Message Publisher -------------------- //
    socket.on('send_message', async (message: MessageProp) => {
        if (startId === undefined) {
            await getStartId();
        }
        // add new message to Redis chat stream
        await pub!.xadd("chat", "*", "username", message.user,
                                "timestamp", message.timestamp.toString(),
                                "message", message.msg);
        const chatLength = await redis.xlen("chat");
        // trim chat stream to 200 messages
        if (chatLength > 200) {
            await redis.xtrim("chat", "MAXLEN", 200);
        }
    });

    // -------------------- Message Cousumer -------------------- //
    // helper function to convert stream value to json object
    const processMessage = (message: any) => {
        const user = message[1][1];
        const timestamp = message[1][3];
        const msg = message[1][5];
        const messageObj: MessageProp = {user: user, timestamp: timestamp, msg: msg};
        console.log(messageObj);
        socket.emit('new_message', messageObj);
    };

    async function listenForMessage(lastId = "$") {
        // `results` is an array, each element of which corresponds to a key.
        if (sub === null) {
            return;
        }
        const results = await sub!.xread("BLOCK", 0, "STREAMS", "chat", lastId);
        if (results === null) {
            await listenForMessage();
        } else {
            const [key, messages] = results[0];
            messages.forEach(processMessage);
            // Pass the last id of the results to the next round.
            await listenForMessage(messages[messages.length - 1][0]);
        }
    }
    listenForMessage();

    // -------------------- Message History -------------------- //
    async function sendHistoryMessage() {
        if (startId === undefined) {
            await getStartId();
        }
        // get last 20 messages
        const messages = await redis.xrevrange("chat", startId, "-", "COUNT", "20");
        // check if there are more messages
        if (messages.length < 20) {
            reachEnd = true;
        } else {
            const pre_messages = await redis.xrevrange("chat", messages[messages.length - 1][0], "-", "COUNT", "2");
            if (pre_messages.length < 2) {
                reachEnd = true;
            } else {
                startId = pre_messages[1][0];
            }
        }
        const messageObjs: MessageProp[] = [];
        messages.reverse();
        messages.forEach((message: any) => {
            const user = message[1][1];
            const timestamp = message[1][3];
            const msg = message[1][5];
            const messageObj: MessageProp = {user: user, timestamp: timestamp, msg: msg};
            messageObjs.push(messageObj);
        });
        socket.emit('history_message', messageObjs);
    }

    async function getStartId() {
        const allMessages = await redis.xrange("chat", "-", "+");
        if (allMessages.length === 0) {
            startId = "+";
        } else {
            startId = allMessages[allMessages.length - 1][0];
        }
    }
    socket.on('request_history', async () => {
        if (reachEnd) {
            socket.emit('history_message', 
            [{user: "System", 
              timestamp: new Date().toDateString(), 
              msg: "[WARNING] No more history messages"}]);
            return;
        }
        if (startId === undefined) {
            await getStartId();
            if (startId === "+") {
                socket.emit('history_message', 
                            [{user: "System", 
                              timestamp: new Date().toDateString(), 
                              msg: "[WARNING] No more history messages"}]);
                reachEnd = true;
                return;
            }
        }
        sendHistoryMessage();
    });

    // -------------------- Disconnect -------------------- //
    socket.on('disconnect', async () => {
        const currentUser = await getUsernameBySocketId(socket.id);
        if (currentUser !== null) {
            await redis.hdel("user-socket-map", currentUser);
            console.log(`user ${currentUser} disconnected`);
        }
        sub!.quit();
        pub!.quit();
        sub = null;
        pub = null;
    });

    async function getUsernameBySocketId(socketId: string): Promise<string | null> {
        const mapping = await redis.hgetall('user-socket-map');
        for (const username in mapping) {
          if (mapping[username] === socketId) {
            return username;
          }
        }
        return null;
      }

});

const port = PortsGlobal.chatServerPort;

server.listen(port, () => {
    console.log(`listening on *: ${port}`);
});
