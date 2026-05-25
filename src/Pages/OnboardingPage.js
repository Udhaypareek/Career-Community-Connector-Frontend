import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Context/ChatProvider";
import TRACK_CATALOG from "../config/trackCatalog";
import { API_BASE_URL } from "../config/apiConfig";

const OnboardingPage = () => {
  const [selected, setSelected] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { user, setUser } = ChatState();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelected(Array.isArray(user.selectedTracks) ? user.selectedTracks : []);
  }, [user, navigate]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleTrack = (trackKey) => {
    setSelected((prev) =>
      prev.includes(trackKey)
        ? prev.filter((key) => key !== trackKey)
        : [...prev, trackKey]
    );
  };

  const submitTracks = async () => {
    if (!selected.length) {
      toast({
        title: "Pick at least one track",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSaving(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.put(
        `${API_BASE_URL}/api/user/tracks`,
        { tracks: selected },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      navigate("/chat");
    } catch (error) {
      toast({
        title: "Could not save your tracks",
        description: error?.response?.data?.message || error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box minH="100dvh" bg="bg.canvas" py={{ base: 8, md: 16 }}>
      <Container maxW="6xl">
        <Flex direction="column" gap={6} textAlign={{ base: "left", md: "center" }}>
          <Heading fontSize={{ base: "3xl", md: "4xl" }}>
            Pick your learning tracks
          </Heading>
          <Text color="text.muted" fontSize={{ base: "md", md: "lg" }}>
            Join one or more communities to get matched with peers, focused chats, and
            study sessions.
          </Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6} mt={10}>
          {TRACK_CATALOG.map((track) => {
            const isSelected = selectedSet.has(track.key);
            const Icon = track.icon;

            return (
              <Box
                key={track.key}
                onClick={() => toggleTrack(track.key)}
                role="button"
                cursor="pointer"
                borderRadius="24px"
                p={6}
                borderWidth="1px"
                borderColor={isSelected ? track.accent : "border.subtle"}
                bg="bg.surface"
                boxShadow={isSelected ? "xl" : "md"}
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
              >
                <Flex align="center" justify="space-between">
                  <Box
                    w="52px"
                    h="52px"
                    borderRadius="18px"
                    bg={track.accent}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="24px"
                  >
                    <Icon />
                  </Box>
                  <Box
                    w="18px"
                    h="18px"
                    borderRadius="full"
                    borderWidth="2px"
                    borderColor={track.accent}
                    bg={isSelected ? track.accent : "transparent"}
                  />
                </Flex>
                <Heading mt={6} fontSize="xl">
                  {track.title}
                </Heading>
                <Text color="text.muted" mt={2} fontSize="sm">
                  {track.description}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>

        <Flex mt={10} justify={{ base: "stretch", md: "center" }}>
          <Button
            colorScheme="brand"
            size="lg"
            px={10}
            onClick={submitTracks}
            isLoading={isSaving}
            isDisabled={!selected.length}
          >
            Save tracks
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default OnboardingPage;
