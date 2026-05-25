import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, Button, Badge, Flex } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { API_BASE_URL } from "../config/apiConfig";
import TRACK_CATALOG from "../config/trackCatalog";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    startCall,
    notification,
    setNotification,
  } = ChatState();
  const toast = useToast();
  const trackAccentMap = TRACK_CATALOG.reduce((acc, track) => {
    acc[track.key] = track.accent;
    return acc;
  }, {});

  const fetchChats = useCallback(async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`${API_BASE_URL}/api/chat`, config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, [user.token, setChats, toast]);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain, fetchChats]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={4}
      bg="bg.surface"
      w={{ base: "100%", md: "31%" }}
      h="100%"
      minH={0}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      boxShadow="sm"
    >
      <Box
        pb={3}
        px={4}
        fontSize={{ base: "24px", md: "28px" }}
        fontWeight="bold"
        w="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex align="center" gap={2}>
          <Text>My Chats</Text>
          <Badge colorScheme="brand" variant="subtle">{chats?.length || 0}</Badge>
        </Flex>
        <GroupChatModal>
          <Button rightIcon={<AddIcon />} size="sm" colorScheme="brand">
            New Group
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        flexDir="column"
        p={3}
        bg="bg.canvas"
        w="100%"
        h="100%"
        minH={0}
        borderRadius="lg"
        overflowY="auto"
      >
        {chats ? (
          <Stack spacing={2}>
            {chats.map((chat) => {
              const unseenCount = notification.filter((n) => n.chat._id === chat._id).length;
              return (
              <Box
                onClick={() => {
                  setSelectedChat(chat);
                  if (unseenCount) {
                    setNotification((prev) => prev.filter((n) => n.chat._id !== chat._id));
                  }
                }}
                cursor="pointer"
                bg={selectedChat === chat ? "brand.500" : "bg.surface"}
                color={selectedChat === chat ? "white" : "text.primary"}
                px={4}
                py={3}
                borderRadius="lg"
                key={chat._id}
                transition="0.2s ease"
                borderWidth="1px"
                borderColor={selectedChat === chat ? "brand.500" : "border.subtle"}
                borderLeftWidth={chat.isTrackChat ? "4px" : "1px"}
                borderLeftColor={chat.isTrackChat ? trackAccentMap[chat.trackKey] || "brand.500" : "border.subtle"}
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                <Flex align="center" justify="space-between" gap={2}>
                  <Text fontWeight="bold">
                    {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                  </Text>
                  <Flex align="center" gap={2}>
                    {chat.isTrackChat && (
                      <Badge colorScheme="brand" variant="solid">
                        Track
                      </Badge>
                    )}

                    {unseenCount > 0 && (
                      <Badge colorScheme="red" variant="solid">
                        {unseenCount}
                      </Badge>
                    )}
                  </Flex>
                </Flex>
                {chat.latestMessage && (
                  <Flex align="center" justify="space-between" gap={2}>
                    <Text fontSize="sm" color={selectedChat === chat ? "whiteAlpha.800" : "text.muted"}>
                      <b>{chat.latestMessage.sender.name}:</b> {" "}
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 50) + "..."
                        : chat.latestMessage.content}
                    </Text>
                    {!chat.isGroupChat && chat.latestMessage.content === "Missed video call" && (
                      <Button
                        size="sm"
                        bgColor={"cadetblue"}
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          startCall(chat);
                        }}
                      >
                        Call back
                      </Button>
                    )}
                  </Flex>
                )}

              </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
