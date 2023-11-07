import { useState, useEffect } from 'react';
import ChatClient from '../Engine/ChatClient';
import './ChatPad.css';


interface ChatPadProps {
    userName: string;
}

interface ClientMessageProp {
  user: string,
  msg: string
  timestamp: string
}

const chatClient = new ChatClient("Yang");
const vancouverTimezone = "America/Vancouver";
const options = { timeZone: vancouverTimezone, hour12: false };

function ChatPad({userName}: ChatPadProps) {
  const [chatLog, setChatLog] = useState<ClientMessageProp[]>([]);

  const onMessageReceived = (msg: ClientMessageProp) => {
    setChatLog((prevLog) => [...prevLog, msg]);
  };
  const onHistoryMessageReceived = (msgs: ClientMessageProp[]) => {
    msgs.forEach((msg) => {
      // delete thi system message from this array
      if (msg.user === "System" && msg.msg === "[WARNING] No more history messages") {
        alert("No more history messages");
        msgs.splice(msgs.indexOf(msg), 1);
      }
    });
    setChatLog((prevlog) => [...msgs, ...prevlog]);
  };
  // initialize the chat client connenction
  useEffect(() => {
    chatClient.connect(onMessageReceived, onHistoryMessageReceived);
    return () => {
      chatClient.disconnect();
    }
  }, []);

  // change the user name
  useEffect(() => {
    chatClient.userName = userName;
  }, [userName]);
  
  const handleSendMessage = () => {
    // get the text from the input
    let inputElement: HTMLInputElement = document.getElementById('inputMessage') as HTMLInputElement;
    let currentMessage = inputElement!.value;
    
    if (currentMessage.length !== 0) {
      chatClient.sendMessage(currentMessage);
      inputElement.value = "";
    } else{
      alert("Message can not be empty!")
    }
  };

  function getChatScopes(msgObj: ClientMessageProp, index: number) {
    if (msgObj.user === userName) { // current user
      return (<div className='chat-message-current' key={index}>
                <div className='user'>{`${msgObj.user} [${msgObj.timestamp}]`}</div>
                <div className='message-current'>{msgObj.msg}</div>
              </div>);
    } else if (msgObj.user === "System" && msgObj.msg === "[WARNING] No more history messages") {
      return;
    } else{ // message from other users
      return (<div className='chat-message-other' key={index}>
                <div className='user'>{`${msgObj.user} [${msgObj.timestamp}]`}</div>
                <div className='message-other'>{msgObj.msg}</div>
              </div>);
    }
  }

  return (
    <div className='chat-container'>
      <button onClick={() => chatClient.loadHistoryMessage()}>Load More</button>
      <div className='chat-window'>
        {chatLog.map((msgObj, index) => (
          // <div className='chat-message' key={index}>
          //   <div className='user'>{`${msgObj.user} [${msgObj.timestamp.toLocaleString('en-US')}]`}</div>
          //   <div className='message'>{msgObj.msg}</div>
          // </div>
          getChatScopes(msgObj, index)
        ))}
      </div>
      
      <div className='chat-input-container'>
        <input
          placeholder="Enter a message"
          type="text"
          id="inputMessage"
          className='messageInput'
        />
        <button onClick={handleSendMessage} className="sendButton">Send</button>
      </div>
    </div>
  );
};

export default ChatPad;
