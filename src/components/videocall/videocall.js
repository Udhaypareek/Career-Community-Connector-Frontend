import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaMicrophoneSlash, FaMicrophone, FaVideo, FaVideoSlash, FaDesktop, FaPhoneSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { ChatState } from "../../Context/ChatProvider";
import Whiteboard from "../miscellaneous/Whiteboard";

const Videocall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [statusText, setStatusText] = useState("Connecting...");
  const [localStream, setLocalStream] = useState(null);
  const hasInitiatedCall = useRef(false);
  const originalStreamRef = useRef(null);
  const activeStreamRef = useRef(null);
  const activeCallRef = useRef(null); // Track the live PeerJS MediaConnection

  const {
    user,
    peerRef,
    myVideoRef,
    remoteVideoRef,
    callSession,
    chatSocketRef,
    sendPeerId,
    endCall,
  } = ChatState();

  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Stable references to prevent recreating Peer instance on updates
  const callSessionRef = useRef(callSession);
  const sendPeerIdRef = useRef(sendPeerId);

  useEffect(() => {
    callSessionRef.current = callSession;
  }, [callSession]);

  useEffect(() => {
    sendPeerIdRef.current = sendPeerId;
  }, [sendPeerId]);

  // Join the video call socket room reliably
  useEffect(() => {
    if (!chatSocketRef?.current || !callSession?.callId) return;
    const socket = chatSocketRef.current;
    const roomId = callSession.callId;

    // Join room immediately and also on reconnection
    const joinRoom = () => {
      socket.emit("join chat", roomId);
    };

    joinRoom();
    socket.on("connected", joinRoom);

    const handleWhiteboardOpen = ({ chatId }) => {
      if (chatId === roomId) onOpen();
    };
    const handleWhiteboardClose = ({ chatId }) => {
      if (chatId === roomId) onClose();
    };

    socket.on("whiteboard open", handleWhiteboardOpen);
    socket.on("whiteboard close", handleWhiteboardClose);

    return () => {
      socket.off("connected", joinRoom);
      socket.off("whiteboard open", handleWhiteboardOpen);
      socket.off("whiteboard close", handleWhiteboardClose);
    };
  }, [chatSocketRef, callSession, onOpen, onClose]);

  useEffect(() => {
    if (!callSession || !user) {
      navigate("/chat");
    }
  }, [callSession, user, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    const myVideoElement = myVideoRef.current;

    return () => {
      const currentLocalStream = myVideoElement?.srcObject;
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach((track) => track.stop());
      }
      if (originalStreamRef.current) {
        originalStreamRef.current.getTracks().forEach((track) => track.stop());
        originalStreamRef.current = null;
      }
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;
      }
    };
  }, [myVideoRef]);

  // Cleanup when callSession is cleared (call ended)
  useEffect(() => {
    if (callSession) return;
    const currentLocalStream = myVideoRef.current?.srcObject;
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => track.stop());
    }
    if (originalStreamRef.current) {
      originalStreamRef.current.getTracks().forEach((track) => track.stop());
      originalStreamRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    activeCallRef.current = null;
  }, [callSession, myVideoRef, peerRef]);

  // 1. Acquire local stream immediately on mount
  useEffect(() => {
    if (!callSession || !user) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
        originalStreamRef.current = stream;
        activeStreamRef.current = stream;
        setLocalStream(stream);
      })
      .catch((error) => {
        console.error("Error getting local media:", error);
        toast({
          title: "Media access denied",
          description: "Please allow camera and microphone access.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // 2. Initialize PeerJS when local stream is available
  useEffect(() => {
    if (!callSession || !user || !localStream) return;

    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", (id) => {
      if (callSessionRef.current?.role === "callee") {
        sendPeerIdRef.current(id);
        setStatusText("Ringing...");
      } else {
        setStatusText("Calling...");
      }
    });

    peer.on("call", (call) => {
      // Store the call reference for screen share track replacement
      activeCallRef.current = call;
      // Answer the call immediately using pre-acquired local stream
      call.answer(localStream);
      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setStatusText("Connected");
      });
      call.on("close", () => {
        activeCallRef.current = null;
      });
    });

    return () => {
      peer.destroy();
      peerRef.current = null;
      hasInitiatedCall.current = false;
      activeCallRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  // 3. Caller side call initiation
  useEffect(() => {
    if (!callSession || callSession.role !== "caller") return;
    if (!callSession.calleePeerId || !localStream || hasInitiatedCall.current) return;

    const makeCall = () => {
      if (!peerRef.current) return;
      const call = peerRef.current.call(callSession.calleePeerId, localStream);
      if (!call) {
        toast({
          title: "Call failed",
          description: "Could not establish a connection.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Store the call reference for screen share track replacement
      activeCallRef.current = call;

      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setStatusText("Connected");
      });

      call.on("close", () => {
        activeCallRef.current = null;
      });

      hasInitiatedCall.current = true;
    };

    if (peerRef.current && peerRef.current.open) {
      makeCall();
    } else if (peerRef.current) {
      peerRef.current.once("open", () => {
        makeCall();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callSession?.calleePeerId, localStream]);

  // Replace the video track in the active PeerJS connection
  const replaceTrackInConnection = (newTrack) => {
    const call = activeCallRef.current;
    if (!call || !call.peerConnection) return;

    const senders = call.peerConnection.getSenders();
    const videoSender = senders.find((s) => s.track && s.track.kind === "video");
    if (videoSender) {
      videoSender.replaceTrack(newTrack);
    }
  };

  const toggleMute = () => {
    const audioTrack = myVideoRef.current?.srcObject?.getAudioTracks()?.[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    const videoTrack = myVideoRef.current?.srcObject?.getVideoTracks()?.[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(!isVideoOn);
    }
  };

  const shareScreen = async () => {
    if (isPresenting) {
      // Stop the screen share stream tracks
      const screenStream = activeStreamRef.current;
      if (screenStream && screenStream !== originalStreamRef.current) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
      // Restore the original camera stream
      const originalStream = originalStreamRef.current;
      if (originalStream && myVideoRef.current) {
        myVideoRef.current.srcObject = originalStream;
        activeStreamRef.current = originalStream;
        // Replace the video track in the live WebRTC connection
        const cameraVideoTrack = originalStream.getVideoTracks()[0];
        if (cameraVideoTrack) {
          replaceTrackInConnection(cameraVideoTrack);
        }
      }
      setIsPresenting(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = screenStream;
      }
      activeStreamRef.current = screenStream;
      setIsPresenting(true);

      // Replace the video track in the live WebRTC connection with the screen share track
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      if (screenVideoTrack) {
        replaceTrackInConnection(screenVideoTrack);

        // When user stops sharing via browser UI, revert to camera
        screenVideoTrack.onended = () => {
          setIsPresenting(false);
          if (originalStreamRef.current && myVideoRef.current) {
            myVideoRef.current.srcObject = originalStreamRef.current;
            activeStreamRef.current = originalStreamRef.current;
            const cameraVideoTrack = originalStreamRef.current.getVideoTracks()[0];
            if (cameraVideoTrack) {
              replaceTrackInConnection(cameraVideoTrack);
            }
          }
        };
      }
    } catch (error) {
      toast({ title: "Screen share failed", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleEndCall = () => {
    const currentLocalStream = myVideoRef.current?.srcObject;
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => track.stop());
    }
    if (originalStreamRef.current) {
      originalStreamRef.current.getTracks().forEach((track) => track.stop());
      originalStreamRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    activeCallRef.current = null;
    endCall();
  };

  const openWhiteboard = () => {
    chatSocketRef.current?.emit("whiteboard open", { chatId: callSession.callId });
    onOpen();
  };

  const closeWhiteboard = () => {
    chatSocketRef.current?.emit("whiteboard close", { chatId: callSession.callId });
    onClose();
  };

  return (
    <Flex
      flexDir="column"
      align="stretch"
      gap={{ base: 3, md: 4 }}
      p={{ base: 3, md: 5 }}
      bg="bg.canvas"
      h="100dvh"
      overflow="hidden"
    >
      <Flex justify="space-between" align="center" flex="0 0 auto" className="fade-up">
        <Box>
          <Heading fontSize={{ base: "xl", md: "2xl" }}>Video Call</Heading>
          <Text color="text.muted" fontSize="sm">{statusText}</Text>
        </Box>
        <Button onClick={openWhiteboard} colorScheme="brand" variant="outline" size={{ base: "sm", md: "md" }}>
          Whiteboard
        </Button>
      </Flex>

      <Flex
        position="relative"
        direction={{ base: "column", md: "row" }}
        gap={4}
        flex="1"
        minH={0}
        overflow="hidden"
        className="fade-up"
      >
        <Box
          flex="1"
          minH={0}
          bg="bg.surface"
          borderRadius={{ base: "18px", md: "22px" }}
          borderWidth="1px"
          borderColor="border.subtle"
          p={{ base: 2, md: 3 }}
          overflow="hidden"
        >
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", borderRadius: "18px", background: "#0f1117", objectFit: "cover" }}
          ></video>
        </Box>
        <Box
          position={{ base: "absolute", md: "static" }}
          top={{ base: 3, md: "auto" }}
          right={{ base: 3, md: "auto" }}
          w={{ base: "128px", md: "260px", lg: "300px" }}
          h={{ base: "168px", md: "100%" }}
          bg="bg.surface"
          borderRadius={{ base: "18px", md: "24px" }}
          borderWidth="1px"
          borderColor="border.subtle"
          p={{ base: 2, md: 3 }}
          boxShadow={{ base: "xl", md: "none" }}
          overflow="hidden"
          flex="0 0 auto"
        >
          <video
            ref={myVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", borderRadius: "14px", background: "#0f1117", objectFit: "cover" }}
          ></video>
        </Box>
      </Flex>

      <Flex
        gap={3}
        mt={0}
        wrap="nowrap"
        justify="center"
        bg="bg.surface"
        borderRadius="24px"
        borderWidth="1px"
        borderColor="border.subtle"
        p={3}
        mx="auto"
        w={{ base: "min(94vw, 360px)", md: "auto" }}
        flex="0 0 auto"
        boxShadow={{ base: "xl", md: "sm" }}
        className="fade-up"
      >
        <IconButton
          _hover={{ bg: "red.800" }}
          onClick={toggleMute}
          icon={isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          bg="red.500"
          color="white"
          aria-label="Toggle mute"
        />
        <IconButton
          _hover={{ bg: "blue.800" }}
          onClick={toggleVideo}
          icon={isVideoOn ? <FaVideo /> : <FaVideoSlash />}
          bg="blue.500"
          color="white"
          aria-label="Toggle video"
        />
        <Tooltip label={isPresenting ? "Stop sharing" : "Share screen"} hasArrow>
          <IconButton
            _hover={{ bg: "gray.800" }}
            onClick={shareScreen}
            icon={<FaDesktop />}
            bg="gray.600"
            color="white"
            aria-label={isPresenting ? "Stop sharing" : "Share screen"}
          />
        </Tooltip>
        <Tooltip label="End call" hasArrow>
          <IconButton
            _hover={{ bg: "red.800" }}
            onClick={handleEndCall}
            icon={<FaPhoneSlash />}
            bg="red.500"
            color="white"
            aria-label="End call"
          />
        </Tooltip>
      </Flex>

      <Modal isOpen={isOpen} onClose={closeWhiteboard} size="xl">
        <ModalOverlay />
        <ModalContent bg="bg.surface">
          <ModalHeader>Whiteboard</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Whiteboard socket={chatSocketRef.current} roomId={callSession?.callId} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Videocall;