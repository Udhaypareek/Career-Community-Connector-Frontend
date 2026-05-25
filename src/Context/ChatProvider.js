import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { API_BASE_URL } from "../config/apiConfig";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [incomingCall, setIncomingCall] = useState(null);
  const [callSession, setCallSession] = useState(null);
  const [callAlert, setCallAlert] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const selectedChatRef = useRef(null);
  const peerRef = useRef(null);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callSocketRef = useRef(null);
  const Navigate = useNavigate();
  const location = useLocation();



  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser((prevUser) => {
      if (
        prevUser?._id === userInfo?._id &&
        prevUser?.token === userInfo?.token &&
        JSON.stringify(prevUser?.selectedTracks || []) === JSON.stringify(userInfo?.selectedTracks || [])
      ) {
        return prevUser;
      }
      return userInfo;
    });

    if (!userInfo) {
      Navigate("/login");
      return;
    }

    const hasTracks = Array.isArray(userInfo?.selectedTracks) && userInfo.selectedTracks.length > 0;
    if (!hasTracks && location.pathname !== "/onboarding") {
      Navigate("/onboarding");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!user || callSocketRef.current) return;

    const socket = io(API_BASE_URL);
    callSocketRef.current = socket;
    socket.emit("setup", user);
    setSocketReady(false);

    socket.on("video call request", (payload) => {
      setIncomingCall(payload);
    });

    socket.on("connected", () => {
      setSocketReady(true);
    });

    socket.on("message received", (newMessageReceived) => {
      const activeChat = selectedChatRef.current;
      if (activeChat && activeChat._id === newMessageReceived.chat._id) {
        return;
      }

      setChats((prevChats) => {
        if (!prevChats) return prevChats;
        const updated = prevChats.map((chat) =>
          chat._id === newMessageReceived.chat._id
            ? { ...chat, latestMessage: newMessageReceived }
            : chat
        );
        const moved = updated.filter((chat) => chat._id === newMessageReceived.chat._id);
        const rest = updated.filter((chat) => chat._id !== newMessageReceived.chat._id);
        return moved.length ? [...moved, ...rest] : updated;
      });

      setNotification((prev) => {
        if (prev.some((n) => n._id === newMessageReceived._id)) {
          return prev;
        }
        return [newMessageReceived, ...prev];
      });
    });

    socket.on("group updated", (payload) => {
      const updatedChat = payload?.chat;
      if (!updatedChat?._id) return;

      setChats((prevChats) => {
        if (!prevChats) return [updatedChat];
        const exists = prevChats.some((chat) => chat._id === updatedChat._id);
        const nextChats = exists
          ? prevChats.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat))
          : [updatedChat, ...prevChats];
        return nextChats;
      });

      setSelectedChat((prevSelected) =>
        prevSelected?._id === updatedChat._id ? updatedChat : prevSelected
      );

      if (payload?.actorId !== user._id) {
        setNotification((prev) => {
          const id = `${payload.type || "group"}-${updatedChat._id}-${payload.userId || ""}`;
          if (prev.some((item) => item._id === id)) return prev;
          return [
            {
              _id: id,
              type: payload.type || "group-updated",
              chat: updatedChat,
              actorName: payload.actorName,
              addedUserName: payload.addedUserName,
            },
            ...prev,
          ];
        });
      }
    });

    socket.on("video call accept", (payload) => {
      setCallSession((prev) =>
        prev
          ? {
              ...prev,
              status: "in-call",
              calleeId: payload.fromUserId,
            }
          : prev
      );
    });

    socket.on("video call peer", (payload) => {
      setCallSession((prev) =>
        prev
          ? {
              ...prev,
              calleePeerId: payload.peerId,
            }
          : prev
      );
    });

    socket.on("video call decline", () => {
      setCallAlert({
        title: "Call declined",
        description: "The other user declined the call.",
        status: "info",
      });
      setCallSession(null);
      Navigate("/chat");
    });

    socket.on("video call busy", () => {
      setCallAlert({
        title: "User is busy",
        description: "They are on another call right now.",
        status: "warning",
      });
      setCallSession(null);
      Navigate("/chat");
    });

    socket.on("video call no-answer", () => {
      setCallAlert({
        title: "No answer",
        description: "The user did not pick up.",
        status: "info",
      });
      setCallSession(null);
      Navigate("/chat");
    });

    socket.on("video call end", () => {
      setCallAlert({
        title: "Call ended",
        description: "The call has ended.",
        status: "info",
      });
      setCallSession(null);
      Navigate("/chat");
    });

    return () => {
      socket.off("video call request");
      socket.off("connected");
      socket.off("message received");
      socket.off("group updated");
      socket.off("video call accept");
      socket.off("video call peer");
      socket.off("video call decline");
      socket.off("video call busy");
      socket.off("video call no-answer");
      socket.off("video call end");
      socket.disconnect();
      callSocketRef.current = null;
      setSocketReady(false);
    };
  }, [user, Navigate]);

  const startCall = (chat) => {
    if (!chat || chat.isGroupChat || !user) return;
    if (callSession) {
      setCallAlert({
        title: "Already in a call",
        description: "End the current call before starting a new one.",
        status: "warning",
      });
      return;
    }
    const callee = chat.users.find((u) => u._id !== user._id);
    if (!callee) return;

    const callId = `${chat._id}-${Date.now()}`;
    const nextSession = {
      status: "outgoing",
      role: "caller",
      callId,
      chatId: chat._id,
      callerId: user._id,
      calleeId: callee._id,
      calleeName: callee.name,
      calleePic: callee.pic,
    };

    setCallSession(nextSession);
    callSocketRef.current?.emit("video call request", {
      callId,
      chatId: chat._id,
      fromUserId: user._id,
      fromUserName: user.name,
      fromUserPic: user.pic,
      toUserId: callee._id,
    });

    Navigate("/videocall");
  };

  const acceptCall = () => {
    if (!incomingCall || !user) return;
    const nextSession = {
      status: "in-call",
      role: "callee",
      callId: incomingCall.callId,
      chatId: incomingCall.chatId,
      callerId: incomingCall.fromUserId,
      callerName: incomingCall.fromUserName,
      callerPic: incomingCall.fromUserPic,
      calleeId: user._id,
    };

    setIncomingCall(null);
    setCallSession(nextSession);
    callSocketRef.current?.emit("video call accept", {
      callId: incomingCall.callId,
      chatId: incomingCall.chatId,
      fromUserId: user._id,
      toUserId: incomingCall.fromUserId,
    });

    Navigate("/videocall");
  };

  const declineCall = () => {
    if (!incomingCall || !user) return;
    callSocketRef.current?.emit("video call decline", {
      callId: incomingCall.callId,
      chatId: incomingCall.chatId,
      fromUserId: user._id,
      toUserId: incomingCall.fromUserId,
    });
    setIncomingCall(null);
  };

  const sendPeerId = (peerId) => {
    if (!callSession || !user) return;
    const targetId =
      callSession.role === "callee" ? callSession.callerId : callSession.calleeId;
    if (!targetId) return;

    callSocketRef.current?.emit("video call peer", {
      callId: callSession.callId,
      peerId,
      fromUserId: user._id,
      toUserId: targetId,
    });
  };

  const endCall = () => {
    if (!callSession || !user) return;
    const targetId =
      callSession.role === "callee" ? callSession.callerId : callSession.calleeId;

    callSocketRef.current?.emit("video call end", {
      callId: callSession.callId,
      chatId: callSession.chatId,
      fromUserId: user._id,
      toUserId: targetId,
    });

    setCallSession(null);
    Navigate("/chat");
  };

  const clearCallAlert = () => {
    setCallAlert(null);
  };

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
      remoteVideoRef: remoteVideoRef,
      incomingCall: incomingCall,
      callSession: callSession,
      callAlert: callAlert,
      socketReady: socketReady,
      chatSocketRef: callSocketRef,
      startCall: startCall,
      acceptCall: acceptCall,
      declineCall: declineCall,
      endCall: endCall,
      sendPeerId: sendPeerId,
      clearCallAlert: clearCallAlert,
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
