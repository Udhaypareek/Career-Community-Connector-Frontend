import {  Button, Flex, Heading, IconButton, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaMicrophoneSlash, FaMicrophone, FaVideo, FaVideoSlash, FaDesktop, FaPhoneSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../Context/ChatProvider';

const Videocall = () => { 
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const {peerRef,myVideoRef,remoteVideoRef} = ChatState();
  const toast = useToast();
  const navigate = useNavigate();

  const toggleMute = () => {
    const audioTrack = myVideoRef.current.srcObject?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    const videoTrack = myVideoRef.current.srcObject?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(!isVideoOn);
    }
  };

  const shareScreen = async () => {
    if (isPresenting) {
      window.location.reload();
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      myVideoRef.current.srcObject = screenStream;
      setIsPresenting(true);
      screenStream.getVideoTracks()[0].onended = () => {
        setIsPresenting(false);
        window.location.reload();
      };
    } catch (error) {
      toast({ title: "Screen share failed", status: "error", duration: 3000, isClosable: true });
    }
  };

  const endCall = () => {
    peerRef.current.destroy();
    navigate("/videocall_landing");
  };

  return (
    <Flex flexDir={"column"} align="center" gap={4} p={4}>
      <Heading>Video Call with </Heading>
      <Flex gap={4}>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "900px", border: "2px solid black" }}></video>
        <video ref={myVideoRef} autoPlay playsInline style={{ width: "200px", border: "2px solid black" }}></video>
      </Flex>
      <Flex gap={4} mt={4}>
        <IconButton _hover = {{bg:"red.800"}} onClick={toggleMute} icon={isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />} bg="red.500" color="white" />
        <IconButton _hover = {{bg:"blue.800"}} onClick={toggleVideo} icon={isVideoOn ? <FaVideo /> : <FaVideoSlash />} bg="blue.500" color="white" />
        <Button _hover = {{bg:"gray.800"}} onClick={shareScreen} leftIcon={<FaDesktop />} bg="gray.600" color="white">{isPresenting ? "Stop Share" : "Share Screen"}</Button>
        <Button _hover = {{bg:"red.800"}} onClick={endCall} leftIcon={<FaPhoneSlash />} bg="red.500" color="white">End</Button>
      </Flex>
    </Flex>
  );
};

export default Videocall;