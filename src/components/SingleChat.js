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
  Button,
  Tooltip
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { FiLogOut, FiPenTool, FiUsers, FiVideo } from "react-icons/fi";
import Whiteboard from "./miscellaneous/Whiteboard";
import { API_BASE_URL } from "../config/apiConfig";
import GroupMembersModal from "./miscellaneous/GroupMembersModal";

const ENDPOINT = API_BASE_URL;
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const {
    selectedChat,
    setSelectedChat,
    user,
    startCall,
    chatSocketRef,
  } = ChatState();
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
      socket?.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load messages", status: "error", duration: 5000, isClosable: true });
    }
  }, [selectedChat, user.token, toast]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket?.emit("stop typing", selectedChat._id);
      try {
        const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` } };
        setNewMessage("");
        const { data } = await axios.post(`${ENDPOINT}/api/message`, { content: newMessage, chatId: selectedChat }, config);
        socket?.emit("new message", data);
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        toast({ title: "Error", description: "Failed to send message", status: "error", duration: 5000, isClosable: true });
      }
    }
  };

  useEffect(() => {
    if (!chatSocketRef?.current) return;
    socket = chatSocketRef.current;
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [chatSocketRef]);

  useEffect(() => {
    if (!socket || !selectedChat?._id) return;

    const handleWhiteboardOpen = ({ chatId }) => {
      if (chatId === selectedChat._id) onOpen();
    };
    const handleWhiteboardClose = ({ chatId }) => {
      if (chatId === selectedChat._id) onClose();
    };

    socket.on("whiteboard open", handleWhiteboardOpen);
    socket.on("whiteboard close", handleWhiteboardClose);

    return () => {
      socket.off("whiteboard open", handleWhiteboardOpen);
      socket.off("whiteboard close", handleWhiteboardClose);
    };
  }, [selectedChat, onOpen, onClose]);

  const openWhiteboard = () => {
    if (selectedChat?._id) {
      socket?.emit("whiteboard open", { chatId: selectedChat._id });
    }
    onOpen();
  };

  const closeWhiteboard = () => {
    if (selectedChat?._id) {
      socket?.emit("whiteboard close", { chatId: selectedChat._id });
    }
    onClose();
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [fetchMessages, selectedChat]);

  useEffect(() => {
    const handleMessageReceived = (newMessageReceived) => {
      if (selectedChatCompare && selectedChatCompare._id === newMessageReceived.chat._id) {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socket?.on("message received", handleMessageReceived);

    return () => {
      socket?.off("message received", handleMessageReceived);
    };
    // eslint-disable-next-line
  }, [selectedChatCompare, setFetchAgain]);

  const handleLeaveGroup = async () => {
    if (!selectedChat?.isGroupChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `${ENDPOINT}/api/chat/groupremove`,
        { chatId: selectedChat._id, userId: user._id },
        config
      );
      setSelectedChat();
      setFetchAgain((prev) => !prev);
      toast({ title: "Left group", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Could not leave group", status: "error", duration: 3000, isClosable: true });
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected || !socket) return;
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
    <Flex flexDir="column" w="100%" h="100%" minH={0} p={{ base: 2, md: 3 }} borderRadius="xl" bg="bg.surface" borderWidth="1px" borderColor="border.subtle">
      {selectedChat ? (
        <>
          <Flex justifyContent="space-between" alignItems="center" pb={3} gap={3} flexWrap="wrap">
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
              display={{ base: "flex", md: "none" }}
              size="sm"
              variant="ghost"
            >
              Chats
            </Button>

            <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="bold" flex="1">
              {selectedChat.isGroupChat ? selectedChat.chatName.toUpperCase() : getSender(user, selectedChat.users)}
            </Text>
            <Flex gap={2} align="center" flexWrap="wrap">
              {!selectedChat.isGroupChat && (
                <Tooltip label="Start video call" hasArrow>
                  <IconButton
                    icon={<FiVideo />}
                    aria-label="Start video call"
                    onClick={() => startCall(selectedChat)}
                    size="md"
                    colorScheme="brand"
                    borderRadius="full"
                  />
                </Tooltip>
              )}
              {selectedChat.isGroupChat && (
                <GroupMembersModal>
                  <Tooltip label="View members" hasArrow>
                    <IconButton
                      icon={<FiUsers />}
                      aria-label="View members"
                      size="md"
                      variant="outline"
                      borderRadius="full"
                    />
                  </Tooltip>
                </GroupMembersModal>
              )}
              <Tooltip label="Open whiteboard" hasArrow>
                <IconButton
                  icon={<FiPenTool />}
                  aria-label="Open Whiteboard"
                  onClick={openWhiteboard}
                  size="md"
                  variant="outline"
                  borderRadius="full"
                />
              </Tooltip>
              {selectedChat.isGroupChat && (
                <Tooltip label="Leave group" hasArrow>
                  <IconButton
                    icon={<FiLogOut />}
                    aria-label="Leave group"
                    size="md"
                    variant="outline"
                    borderRadius="full"
                    onClick={handleLeaveGroup}
                  />
                </Tooltip>
              )}
              {!selectedChat.isGroupChat ? (
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              ) : selectedChat.isTrackChat ? null : (
                <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
              )}
            </Flex>
            {/* code for whiteboard modal */}
            <Box position="absolute" top="10px" right={{ base: "10px", md: "60px" }}>
              <Modal isOpen={isOpen} onClose={closeWhiteboard} size="xl">
                <ModalOverlay />
                <ModalContent bg="bg.surface">
                  <ModalHeader>Interactive Whiteboard</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Whiteboard socket={socket} roomId={selectedChat._id} />
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="red" onClick={closeWhiteboard}>
                      Close
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Box>


          </Flex>
          <Box flex="1" minH={0} overflowY="auto" p={{ base: 2, md: 3 }} bg="bg.canvas" borderRadius="lg">
            {loading ? <Spinner size="xl" alignSelf="center" /> : <ScrollableChat messages={messages} />}
            {istyping && (
              <HStack alignSelf="flex-start" mt={2} ml={0}>
                <Avatar size="xs" />
                <Lottie options={defaultOptions} width={50} height={30} />
              </HStack>
            )}
          </Box>
          <FormControl mt={3} onKeyDown={sendMessage} isRequired>
            <Input
              variant="filled"
              bg="bg.canvas"
              color="text.primary"
              placeholder="Enter a message..."
              value={newMessage}
              onChange={typingHandler}
            />
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
