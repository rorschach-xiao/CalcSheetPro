import { PortsGlobal } from '../ServerDataDefinitions';
import { io } from 'socket.io-client';
import ChatClient from '../Engine/ChatClient';
import { Client } from 'socket.io/dist/client';
import axios from 'axios';
import { on } from 'events';

const port = PortsGlobal.chatServerPort;
const baseURL = `http://localhost:${port}`;

interface ClientMessageProp {
    user: string,
    msg: string
    timestamp: string
  }

const chatClient = new ChatClient("testUser");
const vancouverTimezone = "America/Vancouver";
const socket = io(baseURL);
const messages: ClientMessageProp[]= [];
const historyMessages: ClientMessageProp[] = [];

function onMessageReceived(msg: ClientMessageProp) {
    messages.push(msg);
}
function onHistoryMessageReceived(msgs: ClientMessageProp[]) {
    msgs.forEach((msg: ClientMessageProp) => {
        historyMessages.push(msg);
        console.log("history messages length: " + historyMessages.length);
    });
}

async function resetDatabase() {
    const url = `${baseURL}/reset`;
    return await axios.get(url);
}

async function getDatabaseSize() {
    const url = `${baseURL}/dbSize`;
    const res =  await axios.get(url);
    console.log("database size : " + res.data.length);
    return res.data.length;
}


function runTest() {
    chatClient.connect(onMessageReceived, onHistoryMessageReceived);
    console.log("Running test");
    resetDatabase();

    chatClient.sendMessage("test message1");
    chatClient.sendMessage("test message2");
    chatClient.sendMessage("test message3");
    
    chatClient.loadHistoryMessage();
}

runTest();