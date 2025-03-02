import { Box, Flex } from "@chakra-ui/react";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <Box w="100%" h="100vh" overflow="hidden">
      {user && <SideDrawer />}
      <Flex
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p={4}
        gap={4}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Flex>
    </Box>
  );
};

export default Chatpage;