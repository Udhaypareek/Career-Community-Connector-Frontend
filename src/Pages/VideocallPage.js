import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const VideoCallPage = () => {
  const navigate = useNavigate();
  const { user } = ChatState();

  return (
    <Box minH="100dvh" bg="bg.canvas">
      {user && <SideDrawer />}
      <Flex direction="column" align="center" justify="center" minH="calc(100dvh - 68px)" px={6} textAlign="center">
        <Heading fontSize={{ base: "2xl", md: "3xl" }} textAlign="center">
          Start a call from a chat
        </Heading>
        <Text mt={4} color="text.muted" textAlign="center">
          Open a direct chat and tap the video icon to start a call.
        </Text>
        <Button mt={6} colorScheme="brand" onClick={() => navigate("/chat")}
        >
          Go to chats
        </Button>
      </Flex>
    </Box>
  );
};

export default VideoCallPage;
