import { useState, useEffect } from 'react';
import ChatClient from '../Engine/ChatClient';
import './ChatPad.css';


interface ChatPadProps {
    userName: string;
    chatClient: ChatClient;
}

interface ClientMessageProp {
  user: string,
  msg: string
  timestamp: string
}


const vancouverTimezone = "America/Vancouver";
const options = { timeZone: vancouverTimezone, hour12: false };

function ChatPad({userName, chatClient}: ChatPadProps) {
  const [chatLog, setChatLog] = useState<ClientMessageProp[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
    setNewMessagesCount(0);
  };

  const onMessageReceived = (msg: ClientMessageProp) => {
    setChatLog((prevLog) => [...prevLog, msg]);
    setNewMessagesCount((prevCount) => prevCount + 1);
  };

  const onHistoryMessageReceived = (msgs: ClientMessageProp[]) => {
    msgs.forEach((msg) => {
      if (msg.user === "System" && msg.msg === "[WARNING] No more history messages") {
        // delete this message from the list
        alert("No more history messages");
        msgs.splice(msgs.indexOf(msg), 1);
      }
    });

    setChatLog((prevlog) => [...msgs, ...prevlog]);
  };

  // initialize the chat client connenction
  useEffect(() => {
    chatClient.connect(onMessageReceived, onHistoryMessageReceived);
    setChatLog([]);
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

  function getChatTopContainer() {
    if (isSidebarOpen) {
      return (<div className='chat-top-container'>
                <button onClick={toggleSidebar} className='close-button'>
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"/>
                  </svg>

                </button>
                <button onClick={() => chatClient.loadHistoryMessage()}>Load More</button>
              </div>)
    }
    else {
      return (
        <div className='chat-top-container close'>
          <button onClick={toggleSidebar} className={`open-button ${newMessagesCount > 0 ? 'notification-badge' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
              <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"/>
            </svg>
            {newMessagesCount > 0 && <span className="badge">{newMessagesCount}</span>}
            
          </button>
        </div>
      );
    }
  }

  return (
    <div className={`chat-container ${isSidebarOpen ? '' : 'close'}`}>
      {getChatTopContainer()}
      <div className={`chat-window ${isSidebarOpen ? '' : 'close'}`}>
        {chatLog.map((msgObj, index) => (
          // <div className='chat-message' key={index}>
          //   <div className='user'>{`${msgObj.user} [${msgObj.timestamp.toLocaleString('en-US')}]`}</div>
          //   <div className='message'>{msgObj.msg}</div>
          // </div>
          getChatScopes(msgObj, index)
        ))}
      </div>
      
      <div className={`chat-input-container ${isSidebarOpen ? '' : 'close'}`}>
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
