import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import { API_BASE_URL } from "../../config/apiConfig";

const GroupMembersModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { selectedChat, user, chats, setChats, setSelectedChat } = ChatState();

  const startDirectChat = async (memberId) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { userId: memberId },
        config
      );

      if (!chats?.some((chat) => chat._id === data._id)) {
        setChats([data, ...(chats || [])]);
      }

      setSelectedChat(data);
      onClose();
    } catch (error) {
      toast({
        title: "Could not open chat",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!selectedChat?.isGroupChat) return null;

  return (
    <>
      <Box onClick={onOpen} cursor="pointer">
        {children}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="24px">
          <ModalHeader>Group members</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedChat.users.map((member, index) => (
              <Box key={member._id}>
                <Flex align="center" justify="space-between" py={3}>
                  <Flex align="center" gap={3}>
                    <Avatar size="sm" name={member.name} src={member.pic} />
                    <Box>
                      <Text fontWeight="600">{member.name}</Text>
                      <Text fontSize="sm" color="text.muted">
                        {member.email}
                      </Text>
                    </Box>
                  </Flex>
                  {member._id !== user._id && (
                    <Button size="sm" onClick={() => startDirectChat(member._id)}>
                      Message
                    </Button>
                  )}
                </Flex>
                {index < selectedChat.users.length - 1 && <Divider />}
              </Box>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupMembersModal;
