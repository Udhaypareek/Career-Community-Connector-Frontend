import { Flex, useMediaQuery } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, chats, selectedChat, setSelectedChat } = ChatState();
  const [isLargerThanMd] = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!user || !chats?.length || selectedChat) return;
    if (!isLargerThanMd) return;
    const primaryTrack = user?.selectedTracks?.[0];
    if (!primaryTrack) return;

    const trackChat = chats.find(
      (chat) => chat?.isTrackChat && chat?.trackKey === primaryTrack
    );
    if (trackChat) {
      setSelectedChat(trackChat);
    }
  }, [user, chats, selectedChat, setSelectedChat, isLargerThanMd]);

  return (
    <Flex w="100%" h="100dvh" flexDirection="column" overflow="hidden">
      {user && <SideDrawer />}
      <Flex
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
        w="100%"
        flex="1"
        minH={0}
        p={{ base: 2, md: 4 }}
        gap={{ base: 2, md: 4 }}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Flex>
    </Flex>
  );
};

export default Chatpage;
