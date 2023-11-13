
import io from 'socket.io-client';
import { PortsGlobal, LOCAL_CHAT_SERVER_URL, RENDER_CHAT_SERVER_URL } from '../ServerDataDefinitions';


interface ClientMessageProp {
    user: string,
    msg: string
    timestamp: string
}

class ChatClient {
    private _userName: string;
    private _serverURL: string;
    private _localServerURL: string = LOCAL_CHAT_SERVER_URL;
    private _renderServerURL: string = RENDER_CHAT_SERVER_URL;
    private _serverPort: number = PortsGlobal.chatServerPort;
    private _socket: any; 
    private _server: string;
    constructor(userName: string) {
        this._userName = userName;
        this._serverURL = `${this._localServerURL}:${this._serverPort}`;
        this._server = 'localhost';
    }
    
    connect(onMessageReceived: (msg: ClientMessageProp) => void, onHistoryMessageReceived: (msgs: ClientMessageProp[]) => void) {
        this._socket = io(this._serverURL, {
            reconnection: true, 
            reconnectionAttempts: 5, 
          });

        this._socket.on('new_message', (messageObj: ClientMessageProp) => {
            // convert json to string format
            // const msg: string = `${messageObj.user} [${messageObj.timestamp}]: ${messageObj.msg}`;
            onMessageReceived(messageObj);
        });
        this._socket.on('history_message', (messageObjs: ClientMessageProp[]) => {
            // let msgs: string[] = [];
            // messageObjs.forEach((messageObj: ClientMessageProp) => {
            //     const msg: string = `${messageObj.user} [${messageObj.timestamp}]: ${messageObj.msg}`;
            //     msgs.push(msg);
            // });
            onHistoryMessageReceived(messageObjs);
        });
        this._socket.on('connect', () => {
            console.log(`id: ${this._socket.id}`);
        });
    }

    sendMessage(message: string) {
        if (this._socket && this._userName !== "") {
            const vancouverTimezone = "America/Vancouver";
            const options = { timeZone: vancouverTimezone, hour12: false };

            const currentTime = new Date().toLocaleString("en-US", options);
            // const currentTime = new Date();
            const messageObj: ClientMessageProp = {user: this._userName, msg: message, timestamp: currentTime}
            this._socket.emit('send_message', messageObj);
        } else if (this._userName === "") {
            alert("Please enter a user name!");
        } else {
            alert("Please connect to the server first!");
        }
    }

    loadHistoryMessage() {
        if (this._socket && this._userName !== "") {
            this._socket.emit('request_history');
        } else if (this._userName === "") {
            alert("Please enter a user name!");
        } else {    
            alert("Please connect to the server first!");
        }
    }

    setServerSelector(server: string): void {
        if (server === this._server) {
            return;
        }
        if (server === 'localhost') {
            this._serverURL =`${this._localServerURL}:${this._serverPort}`;
        } else {
            this._serverURL = `${this._renderServerURL}`;
        }
        this._server = server;
    }


    disconnect() {
        if (this._socket) {
            this._socket.disconnect();
        }
    }

    public get userName() {
        return this._userName;
    }

    public set userName(value: string) {
        this._userName = value;
    }

    public get socketId() { 
        return this._socket.id;
    }

    public get server() {
        return this._server;
    }

    
}
export default ChatClient;