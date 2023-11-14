import Redis from 'ioredis';
import ChatClient from '../../Engine/ChatClient';



describe('RedisDatabase', () => {
    let startId: string;

    // test only one message
    test('send 1 message', async () => {
        const redis = new Redis();
        await redis.xtrim("chat", "MAXLEN", 0);

        await redis.xadd("chat", "*", "username", 'test',
            "timestamp", '2022-01-01T00:00:00.000Z',
            "message", 'test message');

        const chatLength = await redis.xlen("chat");
        expect(chatLength).toBe(1);
    });

    // test 10 messages
    test('send 10 messages', async () => {
        const pub = new Redis();
        await pub.xtrim("chat", "MAXLEN", 0);

        for (let i = 0; i < 10; i++) {
            await pub.xadd("chat", "*", "username", 'test',
                "timestamp", '2022-01-01T00:00:00.000Z',
                "message", 'test message');
        }

        const chatLength = await pub.xlen("chat");
        expect(chatLength).toBe(10);
    });

    // test get last 20 messages, the order is reversed
    test('get last 20 messages', async () => {
        const pub = new Redis();
        await pub.xtrim("chat", "MAXLEN", 0);
        
        async function getStartId() {
            const allMessages = await pub.xrange("chat", "-", "+");
            if (allMessages.length === 0) {
                startId = "+";
            } else {
                startId = allMessages[allMessages.length - 1][0];
            }
        }

        if (startId === undefined) {
            await getStartId();
        }

        for (let i = 0; i < 40; i++) {
            await pub.xadd("chat", "*", "username", 'test',
                "timestamp", '2022-01-01T00:00:00.000Z',
                "message", 'test message ' + i);
        }

        const reversedMessages = await pub.xrevrange("chat", startId, "-", "COUNT", "20");
        expect(reversedMessages.length).toBe(20);

        const firstMessage = reversedMessages[0][1][5];
        const lastMessage = reversedMessages[19][1][5];


        expect(firstMessage).toBe("test message 39");
        expect(lastMessage).toBe("test message 20");
        
    });




});
