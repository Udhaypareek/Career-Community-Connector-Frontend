import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDirection="column"
      p={{ base: 2, md: 4 }}
      bg="bg.surface"
      w={{ base: "100%", md: "68%" }}
      h="100%"
      minH={0}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      boxShadow="sm"
    >
      {selectedChat ? (
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      ) : (
        <Box textAlign="center" color="text.muted" fontSize="lg">
          Select a chat to start messaging
        </Box>
      )}
    </Box>
  );
};

export default Chatbox;
