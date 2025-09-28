import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phoneNumber: string;
}

type CallState = 'idle' | 'outgoing' | 'incoming' | 'active' | 'ended';
type CallType = 'audio' | 'video';

interface CallData {
  contact: Contact;
  type: CallType;
  state: CallState;
}

export const useCall = () => {
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const { toast } = useToast();
  const connectTimeoutRef = useRef<number | null>(null);

  const initiateCall = (contact: Contact, type: CallType) => {
    setCurrentCall({
      contact,
      type,
      state: 'outgoing'
    });

    toast({
      title: "Calling...",
      description: `Calling ${contact.name}`,
    });

    // Simulate call connection after 3 seconds
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }
    connectTimeoutRef.current = window.setTimeout(() => {
      setCurrentCall(prev => {
        if (prev && prev.state === 'outgoing') {
          toast({
            title: "Call connected",
            description: `Connected with ${prev.contact.name}`,
          });
          return { ...prev, state: 'active' };
        }
        return prev;
      });
    }, 3000);
  };

  const simulateIncomingCall = (contact: Contact, type: CallType) => {
    setCurrentCall({
      contact,
      type,
      state: 'incoming'
    });

    toast({
      title: "Incoming call",
      description: `${contact.name} is calling...`,
    });
  };

  const answerCall = () => {
    if (currentCall) {
      setCurrentCall({ ...currentCall, state: 'active' });
      toast({
        title: "Call answered",
        description: `Connected with ${currentCall.contact.name}`,
      });
    }
  };

  const endCall = () => {
    if (currentCall) {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      setCurrentCall({ ...currentCall, state: 'ended' });
      toast({
        title: "Call ended",
        description: `Call with ${currentCall.contact.name} ended`,
      });
      
      // Clear call after 2 seconds
      setTimeout(() => {
        setCurrentCall(null);
      }, 2000);
    }
  };

  const declineCall = () => {
    if (currentCall) {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      setCurrentCall({ ...currentCall, state: 'ended' });
      toast({
        title: "Call declined",
        description: `Declined call from ${currentCall.contact.name}`,
      });
      
      // Clear call after 2 seconds
      setTimeout(() => {
        setCurrentCall(null);
      }, 2000);
    }
  };

  return {
    currentCall,
    initiateCall,
    simulateIncomingCall,
    answerCall,
    endCall,
    declineCall,
    isInCall: currentCall !== null
  };
};
