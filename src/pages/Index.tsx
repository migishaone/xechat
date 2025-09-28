import { useState, useEffect } from "react";
import { ChatList } from "@/components/ChatList";
import { ChatWindow } from "@/components/ChatWindow";
import { ContactSync } from "@/components/ContactSync";
import { PhoneAuth } from "@/components/PhoneAuth";
import { CallInterface } from "@/components/CallInterface";
import { useCall } from "@/hooks/useCall";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageSquare } from "lucide-react";
import { wsClient } from "@/services/ws";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  sent: boolean;
  delivered: boolean;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  phoneNumber: string;
  typing?: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
  phoneNumber: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [view, setView] = useState<'chats' | 'contacts'>(() => {
    const saved = localStorage.getItem('xechat:view');
    return saved === 'contacts' ? 'contacts' : 'chats';
  });
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(() => {
    return localStorage.getItem('xechat:selectedChatId') || undefined;
  });
  const { currentCall, initiateCall, answerCall, endCall, declineCall, simulateIncomingCall } = useCall();
  
  // Real-time data via WS
  const [chats, setChats] = useState<Chat[]>([]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  const selectedContact: Contact | undefined = selectedChat ? {
    id: selectedChat.id,
    name: selectedChat.name,
    avatar: selectedChat.avatar,
    online: selectedChat.online,
    phoneNumber: selectedChat.phoneNumber,
  } : undefined;

  const handleSendMessage = (text: string) => {
    if (!selectedChatId || !selectedContact) return;
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      delivered: false,
      read: false,
    };
    setMessages(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), optimistic],
    }));
    wsClient.sendMessage(selectedContact.phoneNumber, text);
  };

  // Persist view and selected chat
  useEffect(() => {
    localStorage.setItem('xechat:view', view);
  }, [view]);

  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem('xechat:selectedChatId', selectedChatId);
    }
  }, [selectedChatId]);

  // Connect WebSocket after auth
  useEffect(() => {
    if (!isAuthenticated || !userPhone) return;
    wsClient.connect(userPhone);
    const offList = wsClient.on('chat:list', (list) => {
      setChats(list as unknown as Chat[]);
    });
    const offUpdate = wsClient.on('chat:update', (payload) => {
      // payload is { [viewerPhone]: ChatSummary }
      const summary = payload[userPhone];
      if (!summary) return;
      setChats(prev => {
        const idx = prev.findIndex(c => c.id === summary.id);
        if (idx === -1) return [...prev, summary];
        const next = prev.slice();
        next[idx] = { ...prev[idx], ...summary };
        return next;
      });
    });
    const offMsg = wsClient.on('message:new', (m) => {
      const chatId = m.chatId as string;
      const entry: Message = {
        id: m.id,
        text: m.text,
        timestamp: m.timestamp,
        sent: m.from === userPhone,
        delivered: true,
        read: m.from === userPhone, // my own message is read by me
      };
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []).filter(x => !String(x.id).startsWith('opt-')), entry],
      }));
    });
    return () => {
      if (offList) offList();
      if (offUpdate) offUpdate();
      if (offMsg) offMsg();
    };
  }, [isAuthenticated, userPhone]);

  const handleContactAdd = (phoneNumber: string, name: string) => {
    const id = [userPhone, phoneNumber].sort().join('|');
    const newChat: Chat = {
      id,
      name,
      phoneNumber,
      lastMessage: "",
      timestamp: "",
      unreadCount: 0,
      online: false,
    };
    setChats(prev => prev.find(c => c.id === id) ? prev : [...prev, newChat]);
    setMessages(prev => ({ ...prev, [id]: [] }));
    setSelectedChatId(id);
    setView('chats');
  };

  if (!isAuthenticated) {
    return <PhoneAuth onAuthenticated={(phone) => {
      setUserPhone(phone);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <>
      <div className="h-screen flex bg-background">
        {/* Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Navigation */}
          <div className="p-4 border-b border-border">
            <div className="flex space-x-2">
              <Button
                variant={view === 'chats' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('chats')}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chats
              </Button>
              <Button
                variant={view === 'contacts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('contacts')}
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Contacts
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {view === 'chats' ? (
              <ChatList 
                chats={chats}
                selectedChatId={selectedChatId}
                onChatSelect={(id) => {
                  setSelectedChatId(id);
                  const c = chats.find(ch => ch.id === id);
                  if (c) wsClient.openChat(c.phoneNumber);
                }}
              />
            ) : (
              <ContactSync onContactAdd={handleContactAdd} />
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1">
          {selectedContact ? (
            <ChatWindow
              contact={selectedContact}
              messages={messages[selectedChatId!] || []}
              onSendMessage={handleSendMessage}
              onInitiateCall={(contact, type) => initiateCall(contact, type)}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-chat-bg">
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                  <MessageSquare className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Welcome to Xe Chat</h3>
                  <p className="text-muted-foreground">Select a chat to start messaging</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Interface Overlay */}
      {currentCall && currentCall.state !== 'idle' && (
        <CallInterface
          contact={currentCall.contact}
          callType={currentCall.type}
          callState={currentCall.state as 'outgoing' | 'incoming' | 'active' | 'ended'}
          onEndCall={endCall}
          onAnswerCall={answerCall}
          onDeclineCall={declineCall}
        />
      )}
    </>
  );
};

export default Index;
