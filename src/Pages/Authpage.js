import {
  Box,
  Container,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Heading,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Login from "../components/Authentication/login";
import Signup from "../components/Authentication/Signup";

function Authpage() {
  const Navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      const hasTracks = Array.isArray(user?.selectedTracks) && user.selectedTracks.length > 0;
      Navigate(hasTracks ? "/chat" : "/onboarding");
    }
  }, [Navigate]);

  return (
    <Box minH="100dvh" bg="bg.canvas" py={{ base: 6, md: 16 }}>
      <Container maxW="5xl">
        <Flex justify="flex-end" mb={{ base: 2, md: 0 }}>
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
            variant="ghost"
            onClick={toggleColorMode}
          />
        </Flex>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={{ base: 8, md: 12 }}
          align="stretch"
        >
          <Box flex="1" py={{ base: 2, md: 8 }} className="fade-up">
            <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="sm" color="text.muted">
              Career Community Connector
            </Text>
            <Heading mt={4} fontSize={{ base: "3xl", md: "4xl" }}>
              Build your focused study circle
            </Heading>
            <Text mt={4} color="text.muted" fontSize={{ base: "md", md: "lg" }}>
              Join track-based communities, chat with peers, and start video sessions
              with whiteboard collaboration.
            </Text>
          </Box>

          <Box
            flex="1"
            bg="bg.surface"
            w="100%"
            p={{ base: 4, md: 6 }}
            borderRadius="24px"
            borderWidth="1px"
            borderColor="border.subtle"
            boxShadow="lg"
            className="fade-up"
          >
            <Tabs isFitted variant="soft-rounded" colorScheme="brand">
              <TabList mb="1em">
                <Tab>Login</Tab>
                <Tab>Sign Up</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={{ base: 0, md: 4 }}>
                  <Login />
                </TabPanel>
                <TabPanel px={{ base: 0, md: 4 }}>
                  <Signup />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}

export default Authpage;
