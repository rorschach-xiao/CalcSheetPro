import ChatClient from '../../Engine/ChatClient';
 
 
 
interface ClientMessageProp {
    user: string;
    msg: string;
    timestamp: string;
}
 
interface SignInResponse {
    user: string,
    status: number
}
 
//Mock the 'socket.io-client' module
//jest.mock('socket.io-client');
 
let messages: ClientMessageProp[] = [];
let historyMessages: ClientMessageProp[] = [];
let chatClient: ChatClient;
 
 
// Mock the Date object to have consistent timestamp in tests
const mockDate = new Date();
global.Date = jest.fn(() => mockDate) as any;
global.alert = jest.fn();
const testlog1 = jest.fn();
const testlog2 = jest.fn();
const testlog3 = jest.fn();
 
describe('ChatClient', () => {
 
    
    beforeEach(async () => {
        chatClient = new ChatClient('testUser');
        let onMessageReceived: (message: ClientMessageProp) => void = (message) => {
            testlog1(`user: ${message.user} msg: ${message.msg}`);
        };
        let onHistoryMessageReceived: (messages: ClientMessageProp[]) => void = (messages) => {
            for (const message of messages) {
                testlog2(`user: ${message.user} history messages: ${message.msg}`);
            }
        };
        let onSignInResponse: (response: SignInResponse) => void = (response) => {
            if (response.status === 200) {
                global.alert(`Congratulation! ${response.user} have signed in successfully!`);
            } else {
                global.alert(`User ${response.user} already signed in!`);
            }
        };
        let onOnlineUsersReceived: (users: string[]) => void = (users) => {
            testlog3(`number of online users: ${users.length}`);
        };
 
        chatClient.connect(
            onMessageReceived,
            onHistoryMessageReceived,
            onSignInResponse,
            onOnlineUsersReceived
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
 
    });
 
    afterEach(async () => {
        jest.clearAllMocks();
        chatClient.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
    });
 
    it('should initialize with correct default values', () => {
        expect(chatClient.userName).toBe('testUser');
        expect(chatClient.server).toBe('localhost');
    });
 
    it('should connect to the server', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(chatClient.socketId);
        expect(chatClient.socketId).not.toBe(undefined);
        
    });
 
    it('should sign in with a valid username', async () => {
        chatClient.signIn('newUser');
        expect(chatClient.userName).toBe('newUser');
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(global.alert).toHaveBeenCalledWith('Congratulation! newUser have signed in successfully!');
    });
 
    it('should not sign in with an empty username', () => {
        chatClient.signIn('');
        expect(global.alert).toHaveBeenCalledWith('Username cannot be empty!');
        //expect(mockSocket.emit).not.toHaveBeenCalled();
    });
 
    it('should alert when signing in with an existing username', async () => {
        chatClient.signIn('newUser2');
        expect(chatClient.userName).toBe('newUser2');
        await new Promise(resolve => setTimeout(resolve, 1000));
        chatClient.signIn('newUser2');
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(global.alert).toHaveBeenCalledTimes(2);
        expect(global.alert).toHaveBeenCalledWith('Congratulation! newUser2 have signed in successfully!');
        expect(global.alert).toHaveBeenCalledWith('User newUser2 already signed in!');
 
        //expect(mockSocket.emit).not.toHaveBeenCalled();
    });
 
    it("test send message", async () => {
        chatClient.signIn('newUser3');
        chatClient.sendMessage("test message");
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(testlog1).toHaveBeenCalledWith('user: newUser3 msg: test message');
 
    });
 
    it("test request history", async () => {
        chatClient.signIn('newUser4');
        for (let i = 0; i < 20; i++) {
            chatClient.sendMessage(`test message ${i}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        chatClient.loadHistoryMessage();
        await new Promise(resolve => setTimeout(resolve, 1000));
        for (let i = 0; i < 20; i++) {
            expect(testlog2).toHaveBeenCalledWith(`user: newUser4 history messages: test message ${i}`);
        }
        
    });
 
    it("test request online users", async () => {
        chatClient.signIn('newUser5');
        chatClient.signIn('newUser6');
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(testlog3).toHaveBeenCalledWith('number of online users: 2');
    });
 
    it('should disconnect from the server', () => {
        chatClient.disconnect();
        expect(chatClient.socketId).toBe(undefined);
    });
 
 
});