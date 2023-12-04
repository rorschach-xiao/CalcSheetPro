import { useState, useEffect, useRef } from 'react';
import ChatClient from '../Engine/ChatClient';
import './ChatPad.css';
import { get } from 'http';

interface SignInResponse {
  user: string,
  status: number
}

interface ChatPadProps {
    userName: string;
    chatClient: ChatClient;
    show: boolean;
    handleToggle: (action: string) => void;
    onSignInResponse: (response: SignInResponse) => void;
}


interface ClientMessageProp {
  user: string,
  msg: string
  timestamp: string
}


const vancouverTimezone = "America/Vancouver";
const options = { timeZone: vancouverTimezone, hour12: false };

function ChatPad({userName, chatClient, show, handleToggle, onSignInResponse}: ChatPadProps) {
  const [chatLog, setChatLog] = useState<ClientMessageProp[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [newMessageFlag, setNewMessageFlag] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [usersWithColor, setUsersWithColor] = useState(new Map<string, string>());


  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  // const [newMessagesCount, setNewMessagesCount] = useState(0);

  useEffect(() => {
    setSidebarOpen(show);
  } ,[show])

  const toggleSidebar = () => {
    setSidebarOpen(false);
    handleToggle("clear");
  };

  const onMessageReceived = (msg: ClientMessageProp) => {
    if (msg.user === "System" && msg.msg ==="[WARNING] Please sign in first") {
      alert("Please sign in first!");
      return;
    }
    setChatLog((prevLog) => [...prevLog, msg]);
    // setNewMessagesCount((prevCount) => prevCount + 1);
    handleToggle("add")
    setNewMessageFlag(true);
  };

  const onHistoryMessageReceived = (msgs: ClientMessageProp[]) => {
    msgs.forEach((msg) => {
      if (msg.user === "System" && msg.msg === "[WARNING] No more history messages") {
        // delete this message from the list
        alert("No more history messages");
        msgs.splice(msgs.indexOf(msg), 1);
      }
    });
    setNewMessageFlag(false);
    setChatLog((prevlog) => [...msgs, ...prevlog]);
    // scroll to the top of the chat window
    if (topRef.current) {
      topRef.current.scrollIntoView({behavior: "smooth", block: "start"});
    }
  };

  const onOnlineUsersReceived = (users: string[]) => {
    setOnlineUsers(users);
    // 生成用户颜色
    let usersWithColor = new Map<string, string>();
    for (let i = 0; i < users.length; i++) {
      if (usersWithColor.has(users[i])) {
        continue;
      }
      usersWithColor.set(users[i], getDarkRandomColor());
    }
    setUsersWithColor(usersWithColor);
  };

  // initialize the chat client connenction
  useEffect(() => {
    chatClient.connect(onMessageReceived, onHistoryMessageReceived, onSignInResponse, onOnlineUsersReceived);
    setChatLog([]);
    return () => {
      chatClient.disconnect();
    }
  }, []);

  // change the user name
  useEffect(() => {
    chatClient.userName = userName;
  }, [userName]);

  // scroll to the bottom of the chat window
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end"});
    }
  }, [chatLog]);
  
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
    if (newMessageFlag) {
      const isLastMessage = index === chatLog.length - 1;
      if (msgObj.user === userName) { // current user
        return (<div className='chat-message-current' key={index} ref={isLastMessage ? bottomRef : null}>
                  <div className='user'>{`${msgObj.user} [${msgObj.timestamp}]`}</div>
                  <div className='message-current'>{msgObj.msg}</div>
                </div>);
      } else if (msgObj.user === "System" && msgObj.msg === "[WARNING] No more history messages") {
        return;
      } else{ // message from other users
        return (<div className='chat-message-other' key={index} ref={isLastMessage ? bottomRef : null}>
                  <div className='user'>{`${msgObj.user} [${msgObj.timestamp}]`}</div>
                  <div className='message-other'>{msgObj.msg}</div>
                </div>);
      }
    } else {
      const isFirstMessage = index === 0;
      if (msgObj.user === userName) { // current user
        return (<div className='chat-message-current' key={index} ref={isFirstMessage ? bottomRef : null}>
                  <div className='user'>{`${msgObj.user} [${msgObj.timestamp}]`}</div>
                  <div className='message-current'>{msgObj.msg}</div>
                </div>);
      } else if (msgObj.user === "System" && msgObj.msg === "[WARNING] No more history messages") {
        return;
      } else{ // message from other users
        return (<div className='chat-message-other' key={index} ref={isFirstMessage ? bottomRef : null}>
                  <div className='user'>{`${msgObj.user} [${msgObj.timestamp}]`}</div>
                  <div className='message-other'>{msgObj.msg}</div>
                </div>);
      }
    }
  }

  function getChatTopContainer() {
    //if (isSidebarOpen) {
    return (<div className={`chat-top-container ${isSidebarOpen ? "": "close"}`}>
              <button onClick={toggleSidebar} className='close-button'>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                  <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"/>
                </svg>

              </button>
              <button onClick={() => chatClient.loadHistoryMessage()}>{`${isSidebarOpen?"Load More":""}`}</button>
            </div>)
    //}
    // else {
    //   return (
    //     <div className='chat-top-container close'>
    //       <button onClick={toggleSidebar} className={`open-button ${newMessagesCount > 0 ? 'notification-badge' : ''}`}>
    //         <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
    //           <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"/>
    //         </svg>
    //         {newMessagesCount > 0 && <span className="badge">{newMessagesCount}</span>}
            
    //       </button>
    //     </div>
    //   );
    // }
  }

  // get a random color for avatar
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
  
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  function isLightColor(color: string) {
    function hexToRgb(hex: string) {
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
    
      return [r, g, b]; 
    }

    let rgb = hexToRgb(color);
  
    let relativeLuminance = (rgb[0] * 0.2126) + (rgb[1] * 0.7152) + (rgb[2] * 0.0722);
  
    let threshold = 0.8;
  
    return relativeLuminance < threshold;
  }

  function getDarkRandomColor() {
    let color;
    do {
      color = getRandomColor(); 
    } while (isLightColor(color)) 
  
    return color;
  }



  function getOnlineUsersScope() {
    return (<div className={`online-users-container ${isSidebarOpen ? '' : 'close'}`}>
              <div className='online-users-title'>Online Users</div>
              <div className='online-users'>
           
                {onlineUsers.map((user, index) => (
                  <div key={index} className='online-user'>
                    <div className='avatar' style={{backgroundColor: usersWithColor.get(user)}}>{user[0]}</div>
                    {user}
                  </div>
                ))}
              </div>
            </div>);
  }
  return (
      <div className={`chat-container ${isSidebarOpen ? '' : 'close'}`}>
        {getChatTopContainer()}
        {getOnlineUsersScope()}
          <div className={`chat-window ${isSidebarOpen ? '' : 'close'}`}>
            {chatLog.map((msgObj, index) => (
              getChatScopes(msgObj, index)
            ))}
          </div>
          {getOnlineUsersScope()}

    
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