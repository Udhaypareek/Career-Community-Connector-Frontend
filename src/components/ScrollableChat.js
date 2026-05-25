import { Avatar, Badge, Button, Flex, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user, selectedChat, startCall } = ChatState();
  const canCallBack = selectedChat && !selectedChat.isGroupChat;
  const myBubble = useColorModeValue("#BEE3F8", "#2A4365");
  const otherBubble = useColorModeValue("#B9F5D0", "#285E61");

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <Flex key={m._id} align="flex-start">
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}

            {m.content === "Missed video call" ? (
              <Flex
                direction="column"
                gap={2}
                marginLeft={isSameSenderMargin(messages, m, i, user._id)}
                marginTop={isSameUser(messages, m, i, user._id) ? 3 : 10}
                borderRadius="16px"
                padding="10px 14px"
                // bg={m.sender._id === user._id ? "red.50" : "orange.50"}
                borderWidth="1px"
                // borderColor={m.sender._id === user._id ? "red.100" : "orange.100"}
                maxWidth="75%"
              >
                <Badge colorScheme={m.sender._id === user._id ? "red" : "blue"} w="fit-content">
                  Missed video call
                </Badge>
                <Text fontSize="sm" color="text.muted">
                  {m.sender._id === user._id ? "No answer" : "You missed a call"}
                </Text>
                {m.sender._id !== user._id && canCallBack && (
                  <Button size="xs" alignSelf="flex-start" onClick={() => startCall(selectedChat)}>
                    Call back
                  </Button>
                )}
              </Flex>
            ) : (
              <span
                style={{
                  backgroundColor: `${m.sender._id === user._id ? myBubble : otherBubble}`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                }}
              >
                {m.content}
              </span>
            )}
          </Flex>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
