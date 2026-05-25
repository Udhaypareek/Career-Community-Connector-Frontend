import {
  Avatar,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";

const CallOverlay = () => {
  const { incomingCall, acceptCall, declineCall } = ChatState();
  const [countdown, setCountdown] = useState(25);
  const audioContextRef = useRef(null);
  const ringIntervalRef = useRef(null);

  const stopRingtone = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playRingtone = () => {
    stopRingtone();

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const playTone = () => {
      if (!audioContextRef.current) return;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 520;
      gain.gain.value = 0.05;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.25);
    };

    playTone();
    ringIntervalRef.current = setInterval(playTone, 2000);
  };

  useEffect(() => {
    if (!incomingCall) return;
    setCountdown(25);
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    playRingtone();

    return () => {
      clearInterval(interval);
      stopRingtone();
    };
  }, [incomingCall]);

  useEffect(() => {
    if (!incomingCall) return;
    if (countdown <= 0) {
      stopRingtone();
      declineCall();
    }
  }, [countdown, incomingCall, declineCall]);

  if (!incomingCall) return null;

  return (
    <Modal isOpen onClose={declineCall} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="24px">
        <ModalHeader>Incoming video call</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex direction="column" align="center" gap={4}>
            <Avatar size="xl" name={incomingCall.fromUserName} src={incomingCall.fromUserPic} className="pulse-soft" />
            <Text fontWeight="600">{incomingCall.fromUserName}</Text>
            <Text color="text.muted" textAlign="center">
              wants to start a study call
            </Text>
            <Text fontSize="sm" color="text.muted">
              Auto-decline in {countdown}s
            </Text>
            <Flex gap={3} w="100%" justify="center">
              <Button
                colorScheme="brand"
                onClick={() => {
                  stopRingtone();
                  acceptCall();
                }}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  stopRingtone();
                  declineCall();
                }}
              >
                Decline
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CallOverlay;
