import { PortsGlobal } from '../ServerDataDefinitions';
import { io } from 'socket.io-client';
import ChatClient from '../Engine/ChatClient';
import axios from 'axios';
import { on } from 'events';

const port = PortsGlobal.chatServerPort;
const baseURL = `http://localhost:${port}`;

interface ClientMessageProp {
    user: string,
    msg: string
    timestamp: string
    }

const vancouverTimezone = "America/Vancouver";
const socket = io(baseURL);
let messages: ClientMessageProp[]= [];
let historyMessages: ClientMessageProp[] = [];

function onMessageReceived(msg: ClientMessageProp) {
    messages.push(msg);
    // console.log("new message received: " + msg.msg);
}

function onHistoryMessageReceived(msgs: ClientMessageProp[]) {
    msgs.forEach((msg: ClientMessageProp) => {
        historyMessages.push(msg);
        console.log("history messages length: " + historyMessages.length);
    });
}

function onSignInResponse(response: any) {
    console.log("sign in response: " + response);
}

function onOnlineUsersReceived(users: string[]) {
    console.log("online users: " + users);
}

async function resetDatabase() {
    const url = `${baseURL}/reset`;
    console.log("resetting database");
    return await axios.get(url);
}

async function getDatabaseSize(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        // send event to server
        socket.emit('db_size');
        // listen for response
        socket.once('db_size_response', (response) => {
            if (response.size !== undefined) {
                // console.log("getDatabaseSize(): " + response.size);
                resolve(response.size);
            } else if (response.error !== undefined) {
                console.error("Error:", response.error);
                reject(new Error(response.error));
            }
        });
    });
}

async function testSendMessages(numberOfMessages: number, chatClient: ChatClient) {
    
    const messages = [
        'Hello World',
        'This is a test',
        'This is a test of the emergency broadcast system',
        'This is only a test',
        'Had this been an actual emergency',
        'You would have been instructed',
        'Where to tune in your area',
        'This concludes this test of the emergency broadcast system'
    ];

    const promises: Promise<any>[] = [];
    for (let i = 0; i < numberOfMessages; i++) {
        const message = messages[Math.floor(Math.random() * messages.length)];
        // const user = users[Math.floor(Math.random() * users.length)];
        chatClient.sendMessage(message);
    }
    // console.log("messages sent");
}

async function testGetMessages(testName: string, expectedCount: number) {

    let numberOfMessages : number = 0;

    await new Promise(resolve => setTimeout(resolve, 300));
    numberOfMessages = await getDatabaseSize();

    console.log('*'.repeat(80) + '\n');
    console.log(`Test: ${testName}`);
    console.log(`Expected: ${expectedCount} messages`);
    if (numberOfMessages !== expectedCount) {
        console.error(`Error: expected ${expectedCount} messages, but got ${numberOfMessages}`);
        return;
    }
    console.log(`Success: got ${numberOfMessages} messages`)
    console.log('\n' + '*'.repeat(80));
}

async function runTest() {
    const chatClient1 = new ChatClient("testUser1");
    chatClient1.connect(onMessageReceived, onHistoryMessageReceived, onSignInResponse, onOnlineUsersReceived);
    chatClient1.signIn("testUser1");
    console.log("Running test");
    
    
    // send 1 message
    await resetDatabase();
    await testSendMessages(1, chatClient1);
    await testGetMessages("send 1 message", 1);
    chatClient1.disconnect();


    // send 10 messages
    const chatClient2 = new ChatClient("testUser2");
    chatClient2.connect(onMessageReceived, onHistoryMessageReceived, onSignInResponse, onOnlineUsersReceived);
    chatClient2.signIn("testUser2");
    await resetDatabase();
    await testSendMessages(10, chatClient2);
    await testGetMessages("send 10 messages", 10);
    chatClient2.disconnect();


    // send 20 messages
    const chatClient3 = new ChatClient("testUser3");
    chatClient3.connect(onMessageReceived, onHistoryMessageReceived, onSignInResponse, onOnlineUsersReceived);
    chatClient3.signIn("testUser3");
    await resetDatabase();
    await testSendMessages(20, chatClient3);
    await testGetMessages("send 20 messages", 20);
    chatClient3.disconnect();


    // send 100 messages
    const chatClient4 = new ChatClient("testUser4");
    chatClient4.connect(onMessageReceived, onHistoryMessageReceived, onSignInResponse, onOnlineUsersReceived);
    chatClient4.signIn("testUser4");
    await resetDatabase();
    await testSendMessages(100, chatClient4);
    await testGetMessages("send 100 messages", 100);
    chatClient4.disconnect();

    // send 200 messages
    const chatClient5 = new ChatClient("testUser5");
    chatClient5.connect(onMessageReceived, onHistoryMessageReceived, onSignInResponse, onOnlineUsersReceived);
    chatClient5.signIn("testUser5");
    await resetDatabase();
    await testSendMessages(200, chatClient5);
    await testGetMessages("send 200 messages", 200);
    chatClient5.disconnect();

    // send 201 messages
    const chatClient6 = new ChatClient("testUser6");
    chatClient6.connect(onMessageReceived, onHistoryMessageReceived, onSignInResponse, onOnlineUsersReceived);
    chatClient6.signIn("testUser6");
    await resetDatabase();
    await testSendMessages(201, chatClient6);
    await testGetMessages("send 201 messages", 200);
    chatClient6.disconnect();

    socket.disconnect();
}

runTest();