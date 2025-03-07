import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import Peer from "peerjs";
import { useToast, Avatar, Box, Button, Flex, Heading, Input } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import SideDrawer from "../components/miscellaneous/SideDrawer";



const VideoCallPage = () => {
  const { user,peerRef,myVideoRef,remoteVideoRef } = ChatState();

  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [callIncoming, setCallIncoming] = useState(false);
  const [callerId, setCallerId] = useState("");
  const toast = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;
    peer.on("open", (id) => {
      setPeerId(id);
      localStorage.setItem("peerId", id);
    });

    peer.on("call", (call) => {
      setCallIncoming(true);
      setCallerId(call.peer);

      toast({
        title: "Incoming Call",
        description: `Call from ${call.peer}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });

      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        // console.log("Media stream obtained:", stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        setCallIncoming(false);
      }).then(() => navigate("/videocall"));
    });
  }, [navigate]);

  const handleInputChange = (e) => {
    const id = e.target.value;
    setRemotePeerId(id);
  };


  const startCall = () => {
    if (!peerRef.current) {
      toast({
        title: "Peer connection not initialized",
        description: "Please wait a moment or refresh the page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!remotePeerId) {
      toast({
        title: "Invalid Peer ID",
        description: "Please enter a valid Peer ID to call.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      // console.log("Media stream obtained:", stream);
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      const call = peerRef.current.call(remotePeerId, stream);

      if (!call) {
        toast({
          title: "Call Failed",
          description: "Could not establish a connection.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      toast({
        title: "Calling...",
        description: `Connecting to ${remotePeerId}`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      setTimeout(() => {
        if (!remoteVideoRef.current.srcObject) {
          toast({
            title: "Call Failed",
            description: "Could not connect to the peer.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }, 5000);

    }).then(() => navigate("/videocall")).catch((error) => {
      console.error("Error getting user media:", error);
      toast({
        title: "Media Access Denied",
        description: "Please allow camera and microphone access.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
  };


  return (
    <Box height="100vh" bg="gray.70" >
      <SideDrawer />

      <Flex
        color="Black"
        marginTop="10%"
        gap={10}
        justify="center"
        align="center"
        flexDir={{ base: "column", md: "row" }}
      >
        {/* Input Section */}
        <Box
          display="flex"
          flexDir="column"
          alignItems="center"
          gap={5}
          bg="gray.50"
          p={6}
          borderRadius="lg"
          boxShadow="lg"
          width={{ base: "90%", md: "40%" }}
        >
          <Heading fontSize="xl" textAlign="center">
            Enter the ID of your friend to start a video call
          </Heading>
          <Input
            placeholder="Enter the ID of your friend"
            value={remotePeerId}
            onChange={handleInputChange}
            focusBorderColor="blue.500"
            width="100%"
          />
          <Button
            onClick={startCall}
            colorScheme="blue"
            width="60%"
            _hover={{ transform: "scale(1.05)", transition: "0.2s ease-in-out" }}
          >
            Join Call
          </Button>
        </Box>

        {/* Avatar Section */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          p={6}
          bg="gray.50"
          borderRadius="lg"
          boxShadow="lg"
          width={{ base: "90%", md: "30%" }}
        >
          <Avatar
            size="2xl"
            name={user?.name}
            src={user?.pic}
            cursor="pointer"
            mb={3}
            border="2px solid white"
          />
          <Box
            border="1px solid white"
            px={4}
            py={2}
            borderRadius="md"
            fontSize="lg"
            textAlign="center"
          >
            {user?.name}
          </Box>
          <Box
            border="1px solid white"
            px={4}
            py={2}
            borderRadius="md"
            fontSize="lg"
            textAlign="center"
          >
            {localStorage.getItem("peerId")}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default VideoCallPage;
