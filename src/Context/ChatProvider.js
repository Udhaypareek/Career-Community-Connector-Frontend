import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const peerRef = useRef(null);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const Navigate = useNavigate();



  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // console.log(userInfo);
    setUser(userInfo);
    if (!userInfo) Navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChatContext.Provider
    value={{
      selectedChat: selectedChat,
      setSelectedChat: setSelectedChat,
      user: user,
      setUser: setUser,
      notification: notification,
      setNotification: setNotification,
      chats: chats,
      setChats: setChats,
      peerRef: peerRef,
      myVideoRef: myVideoRef,
      remoteVideoRef: remoteVideoRef
    }}    
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
