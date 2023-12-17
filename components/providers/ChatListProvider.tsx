"use client"
import { createContext,useState } from "react"

export const chatListContext = createContext<ChatList | null>(null);

const ChatListProvider = ({children,defaultChatList = []}:{children:React.ReactNode,defaultChatList?:ChatItem[]}) => {
  const [chats,setChats] = useState<ChatItem[]>(defaultChatList);
  
  const addChatToList = (chat:ChatItem) => {
    let isOnline:boolean;
    setChats((prev:ChatItem[]) => {
      const newChats = chats.filter(item => {
        if(item.username === chat.username) isOnline = item.isOnline;
        return item.username !== chat.username as string;
      });
      chat.isOnline = isOnline;  
      if(newChats.length <= 0) return [chat];
      return [chat,...newChats]
    });
  } 
  
  const clearUnreadCount = (targetId:string) => {
    setChats((prev:ChatItem[]) => {
      return prev.map((item) => {
        if(item.username === targetId) item.unread = undefined;
        return item;
      });
    });
  }
  const setOnlineUser = (userId:string,isOnline:boolean) => {
    setChats((prev:ChatItem[]) => {
      return prev.map((item) => {
        if(item.username === userId) item.isOnline = isOnline;
        return item;
      });
    });
  }
  return (
  <chatListContext.Provider value={{chats,addChatToList,clearUnreadCount,setOnlineUser}}>
  {children}
  </chatListContext.Provider>
  )
}

export default ChatListProvider; 
