"use client"
import UserMessage from "../ui/message/UserMessage"
import ChatInput from "./ChatInput"
import { useState,useRef, useEffect, useContext } from "react"
import { chatListContext } from "../providers/ChatListProvider"
import { Socket } from "socket.io-client"
import MediaMessage from "../ui/message/MediaMessage"

type ChatBodyT = {
  accessToken:string,
  userTarget:UserTarget,
  defaultMessages?:UserMessage[],
  isOnline:boolean,
  socket:Socket
}

const ChatBody = ({accessToken,userTarget,defaultMessages=[],isOnline,socket}:ChatBodyT) => { 
  const messageContainer = useRef<HTMLUListElement | null>(null);
  const [messages,setMessages] = useState<(UserMessage|MediaMessage)[]>(defaultMessages);
  const { chats, addChatToList,clearUnreadCount } = useContext(chatListContext) as ChatList

  useEffect(() => {    
    const receiveMessage = ({content,from}:{content:{message?:string,images?:string[]},from:ChatItem}) => {
      if(from.username !== userTarget.username) return;
      const userMessage = {
       ...content,
       isCurrentUser:false,
       createdAt:from.createdAt
      } 
      setMessages(prev => [...prev,userMessage as any]);
      socket.emit("messagesRead",userTarget.username);
      clearUnreadCount(userTarget.username);
    }  
    socket.on("message", receiveMessage);
    socket.emit("messagesRead",userTarget.username);
    clearUnreadCount(userTarget.username);
    return () => {
      socket.off("message", receiveMessage);
    }
  },[]);

  useEffect(() => {
    messageContainer!.current!.scrollTop = messageContainer!.current!.scrollHeight;
  },[messages]);

  const sendMessage = (message:UserMessage|MediaMessage) => {
    socket.emit("message",{message,to:userTarget.username});
    setMessages(prev => [...prev,message]);

    let newChat:ChatItem = {
      username:userTarget.username,
      avatar:userTarget.avatar,
      name:userTarget.name,
      createdAt:message.createdAt,
      message:"message" in message ? message.message : "images",
      isOnline:false,
    }    
      
    addChatToList(newChat); 
  }
  return (
    <div className="h-[92%] bg-light flex flex-col overflow-hidden rounded-xl mb-3 sm:mb-0 m-0 sm:mx-3 relative">

      <ul ref={messageContainer} className="w-full h-full overflow-y-auto flex flex-col gap-4 px-3 pt-4 custom-scrollbar scroll-smooth">
        <div className="w-full flexCenter">
          <span className="bg-white text-sm px-4 py-1 rounded-full">Today</span>
        </div>
        {messages.map((msg,index) => {
          return "message" in msg ? (
            <li key={index} className={`w-full flex ${msg.isCurrentUser ? "justify-end":"justify-start"}`}>
              < UserMessage
              message={msg.message}
              createdAt={msg.createdAt}
              isCurrentUser={msg.isCurrentUser}/>
            </li>
          ) : 
            <li key={index}>
              <MediaMessage
              media={msg.media as string[]} 
              createdAt={msg.createdAt} 
              isCurrentUser={msg.isCurrentUser} />
            </li>
        })}
      </ul>
      <div className="w-full">
          <ChatInput username={userTarget.username} setMessage={sendMessage} />
      </div>
    </div>
  )
}

export default ChatBody

      // <div className="absolute top-0 right-0 left-0 px-4 py-4">
      //   <div className="w-full bg-white/50 flexBetween rounded-xl backdrop-blur px-5 py-4">
      //     <span>👋 Hi there ! 🌟 Ready to be friend ?</span>
      //     <div className="flexCenter gap-[13px]">
      //       <button className="px-4 py-[6px] bg-dark text-white text-[15px] font-medium rounded-[10px]">Accept</button>
      //       <button className="px-4 py-[6px] bg-netral/20 text-[15px] font-medium rounded-[10px]">Decline</button>
      //     </div>
      //   </div>
      // </div>
