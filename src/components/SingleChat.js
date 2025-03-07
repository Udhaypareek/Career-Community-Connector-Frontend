import { useEffect, useState, useCallback } from "react";
import {
  Box, Text, Flex, VStack, Input, IconButton,
  Spinner, useToast, HStack, Avatar, FormControl,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import axios from "axios";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { FaStar } from "react-icons/fa";
import Whiteboard from "./miscellaneous/Whiteboard";

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${ENDPOINT}/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load messages", status: "error", duration: 5000, isClosable: true });
    }
  }, [selectedChat, user.token, toast]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` } };
        setNewMessage("");
        const { data } = await axios.post(`${ENDPOINT}/api/message`, { content: newMessage, chatId: selectedChat }, config);
        socket.emit("new message", data);
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        toast({ title: "Error", description: "Failed to send message", status: "error", duration: 5000, isClosable: true });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [fetchMessages, selectedChat]);

  useEffect(() => {
    const handleMessageReceived = (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        if (!notification.some((n) => n._id === newMessageReceived._id)) {
          setNotification((prev) => [newMessageReceived, ...prev]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
    // eslint-disable-next-line
  }, [selectedChatCompare, notification, setNotification, setFetchAgain]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    setTimeout(() => {
      setTyping(false);
      socket.emit("stop typing", selectedChat._id);
    }, 1500);
  };

  return (
    <Flex flexDir="column" w="100%" h="100%" p={3} borderRadius="lg" bg="#F8F8F8">
      {selectedChat ? (
        <>
          <Flex justifyContent="space-between" alignItems="center" pb={3}>
            <IconButton icon={<ArrowBackIcon />} onClick={() => setSelectedChat("")} display={{ base: "flex", md: "none" }} />

            <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="bold">
              {selectedChat.isGroupChat ? selectedChat.chatName.toUpperCase() : getSender(user, selectedChat.users)}
            </Text>
            {/* code for whiteboard modal */}
            <IconButton
              icon={<FaStar />}
              aria-label="Open Whiteboard"
              onClick={onOpen}
              size="lg"
              colorScheme="yellow"
              borderRadius="full"
            />

            <Box position="absolute" top="10px" right="60px">
              <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Interactive Whiteboard</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Whiteboard onClose={onClose} />
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="red" onClick={onClose}>
                      Close
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Box>


            {!selectedChat.isGroupChat ? <ProfileModal user={getSenderFull(user, selectedChat.users)} /> : <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
          </Flex>
          <Box flexGrow={1} overflowY="auto" p={3} bg="#E8E8E8" borderRadius="lg">
            {loading ? <Spinner size="xl" alignSelf="center" /> : <ScrollableChat messages={messages} />}
            {istyping && (
              <HStack alignSelf="flex-start" mt={2} ml={0}>
                <Avatar size="xs" />
                <Lottie options={defaultOptions} width={50} height={30} />
              </HStack>
            )}
          </Box>
          <FormControl mt={3} onKeyDown={sendMessage} isRequired>
            <Input variant="filled" bg="#E0E0E0" placeholder="Enter a message..." value={newMessage} onChange={typingHandler} />
          </FormControl>
        </>
      ) : (
        <VStack justifyContent="center" alignItems="center" h="100%">
          <Text fontSize="2xl">Click on a user to start chatting</Text>
        </VStack>
      )}
    </Flex>
  );
};

export default SingleChat;
