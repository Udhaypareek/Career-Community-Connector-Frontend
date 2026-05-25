import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";

const CallStatusToast = () => {
  const toast = useToast();
  const { callAlert, clearCallAlert } = ChatState();

  useEffect(() => {
    if (!callAlert) return;

    toast({
      title: callAlert.title,
      description: callAlert.description,
      status: callAlert.status || "info",
      duration: 4000,
      isClosable: true,
      position: "top",
    });

    clearCallAlert();
  }, [callAlert, toast, clearCallAlert]);

  return null;
};

export default CallStatusToast;
