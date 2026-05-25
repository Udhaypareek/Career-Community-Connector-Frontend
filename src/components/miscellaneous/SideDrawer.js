import {
  Box,
  Button,
  Input,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Avatar,
  Badge,
  Spinner,
  useColorMode,
  useDisclosure,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModal";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";
import { API_BASE_URL } from "../../config/apiConfig";
import { FiHome, FiMoon, FiSearch, FiSun, FiMessageCircle } from "react-icons/fi";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, chats, setChats, setSelectedChat, notification, setNotification } = ChatState();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const isHome = location.pathname === "/";
  const isChat = location.pathname.startsWith("/chat");

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      return toast({
        title: "Enter a search term",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_BASE_URL}/api/chat`, { userId }, config);

      if (!chats?.some((chat) => chat._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error accessing chat",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoadingChat(false);
      navigate("/chat");
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="bg.surface"
        p={{ base: 2, md: 3 }}
        borderWidth="1px"
        borderColor="border.subtle"
      >
        <Text
          as="button"
          onClick={() => navigate("/")}
          fontSize={{ base: "sm", sm: "md", md: "lg" }}
          fontWeight="700"
          textAlign="left"
          lineHeight="1.1"
          maxW={{ base: "150px", sm: "240px", md: "none" }}
        >
          Career Community Connector
        </Text>

        <Box display="flex" alignItems="center">
          <IconButton
            aria-label="Go to home"
            icon={<FiHome />}
            variant="ghost"
            onClick={() => navigate("/")}
            color={isHome ? "brand.500" : "text.muted"}
            _hover={{ bg: "bg.canvas" }}
            mr={1}
          />
          <IconButton
            aria-label="Go to chats"
            icon={<FiMessageCircle />}
            variant="ghost"
            onClick={() => navigate("/chat")}
            color={isChat ? "brand.500" : "text.muted"}
            _hover={{ bg: "bg.canvas" }}
            mr={1}
          />
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
            variant="ghost"
            onClick={toggleColorMode}
            color="text.muted"
            _hover={{ bg: "bg.canvas" }}
            mr={1}
          />
          
          <Menu>
            <MenuButton p={1}>
              <Box position="relative" className={notification.length ? "notify-pulse" : undefined}>
                <BellIcon fontSize="2xl" m={1} />
                {notification.length > 0 && (
                  <Badge
                    position="absolute"
                    top="-6px"
                    right="-6px"
                    minW="20px"
                    h="20px"
                    px={1}
                    borderRadius="full"
                    colorScheme="red"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    boxShadow="0 0 0 3px var(--chakra-colors-chakra-body-bg)"
                  >
                    {notification.length > 99 ? "99+" : notification.length}
                  </Badge>
                )}
              </Box>
            </MenuButton>
            <MenuList>
              {notification.length ? (
                notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.type === "group-user-added"
                      ? `${notif.addedUserName || "New user"} joined ${notif.chat.chatName}`
                      : notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))
              ) : (
                <Text textAlign="center" py={2} color="text.muted">
                  No New Messages
                </Text>
              )}
            </MenuList>
          </Menu>
          
          <Menu>
            <MenuButton
              as={Button}
              bg="transparent"
              color="text.primary"
              rightIcon={<ChevronDownIcon />}
              px={{ base: 2, md: 4 }}
              _hover={{ bg: "bg.canvas" }}
              _active={{ bg: "bg.canvas" }}
            >
              <Avatar size="sm" cursor="pointer" name={user?.name} src={user?.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuItem icon={<FiSearch />} onClick={onOpen}>
                Find people
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="bg.surface">
          <DrawerHeader borderBottomWidth="1px" borderColor="border.subtle">
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button colorScheme="brand" onClick={handleSearch}>
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
