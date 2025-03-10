import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null); 
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("https://career-community-connector-backend.onrender.com/api/chat", config);
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
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={4}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      boxShadow="md"
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
        My Chats
        <GroupChatModal>
          <Button rightIcon={<AddIcon />} size="sm" colorScheme="blue">
            New Group
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="auto"
      >
        {chats ? (
          <Stack spacing={2}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "teal.500" : "gray.200"}
                color={selectedChat === chat ? "white" : "black"}
                px={4}
                py={3}
                borderRadius="lg"
                key={chat._id}
                transition="0.3s ease-in-out"
                _hover={{ bg: "teal.400", color: "white" }}
              >
                <Text fontWeight="bold">
                  {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="sm" color="gray.600">
                    <b>{chat.latestMessage.sender.name}:</b> {" "}
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 50) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;