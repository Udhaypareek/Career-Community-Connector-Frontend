import { Box, Button, Container, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import TRACK_CATALOG from "../config/trackCatalog";
import { ChatState } from "../Context/ChatProvider";

const Homepage = () => {
  const navigate = useNavigate();
  const chatContext = ChatState?.() || {};
  const { user } = chatContext;

  const handlePrimaryAction = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const hasTracks = Array.isArray(user?.selectedTracks) && user.selectedTracks.length > 0;
    navigate(hasTracks ? "/chat" : "/onboarding");
  };

  return (
    <Box minH="100dvh" bg="bg.canvas">
      {user && <SideDrawer />}
      <Container maxW="6xl" py={{ base: 10, md: 16 }}>
        <Flex direction={{ base: "column", md: "row" }} align="center" gap={10}>
          <Box flex="1" className="fade-up">
            <Text
              textTransform="uppercase"
              letterSpacing="0.2em"
              fontSize="sm"
              color="text.muted"
            >
              Career Community Connector
            </Text>
            <Heading mt={3} fontSize={{ base: "3xl", md: "4xl" }}>
              Build your study circle around the tracks that matter most
            </Heading>
            <Text mt={4} color="text.muted" fontSize={{ base: "md", md: "lg" }}>
              Join focused communities, chat with peers, and hop into live study sessions
              with video + whiteboard collaboration.
            </Text>
            <Flex mt={6} gap={3} direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "center" }}>
              <Button
                size="lg"
                colorScheme="brand"
                onClick={handlePrimaryAction}
              >
                {user ? "Continue" : "Get started"}
              </Button>
              {user && (
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="brand"
                  onClick={() => navigate("/onboarding")}
                >
                  Join more tracks
                </Button>
              )}
            </Flex>
          </Box>

          <Box
            flex="1"
            bg="bg.surface"
            borderRadius="28px"
            p={{ base: 6, md: 8 }}
            borderWidth="1px"
            borderColor="border.subtle"
            boxShadow="xl"
            className="fade-up"
          >
            <Text fontSize="sm" color="text.muted" textTransform="uppercase" letterSpacing="0.2em">
              Active Tracks
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={4}>
              {TRACK_CATALOG.slice(0, 6).map((track) => (
                <Box
                  key={track.key}
                  borderRadius="18px"
                  p={4}
                  bg="bg.canvas"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  borderLeftWidth="4px"
                  borderLeftColor={track.accent}
                  transition="0.2s ease"
                  _hover={{ transform: "translateY(-2px)" }}
                >
                  <Text fontWeight="600">{track.title}</Text>
                  <Text fontSize="sm" color="text.muted" mt={1}>
                    {track.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Homepage;
