import {
  Box,
  Button,
  Input,
  Text,
  Tooltip,
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
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModal";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, chats, setChats, setSelectedChat, notification, setNotification } = ChatState();
  const navigate = useNavigate();
  const toast = useToast();

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
      const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);
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
      const { data } = await axios.post("http://localhost:5000/api/chat", { userId }, config);

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
      navigate("/chat")
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" bg="white" p={3} borderWidth="1px">
        <Tooltip label="Search users to chat" hasArrow>
          <Button variant="ghost" onClick={onOpen} leftIcon={<i className="fas fa-search" style={{ color: "black" }}></i>}>
            <Text display={{ base: "none", md: "flex" }} px={4}>Search User</Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">Career Community Connector</Text>

        <Box display="flex" alignItems="center">
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList>
              {notification.length ? (
                notification.map((notif) => (
                  <MenuItem key={notif._id} onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}>
                    {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))
              ) : (
                <Text textAlign="center">No New Messages</Text>
              )}
            </MenuList>
          </Menu>
          
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer"
               name={user?.name}
               src={user?.pic} 
               />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input placeholder="Search by name or email" mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? <ChatLoading /> : searchResult.map((user) => <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)} />)}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
