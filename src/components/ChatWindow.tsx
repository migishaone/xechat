import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Phone, Video, MoreVertical } from "lucide-react";

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

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onInitiateCall: (contact: Contact, type: 'audio' | 'video') => void;
}

export const ChatWindow = ({ contact, messages, onSendMessage, onInitiateCall }: ChatWindowProps) => {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat-bg">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {contact.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {contact.online && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-online-indicator rounded-full border-2 border-card"></div>
            )}
          </div>
          <div>
            <h2 className="font-medium text-foreground">{contact.name}</h2>
            <p className="text-xs text-muted-foreground">
              {contact.typing ? "typing..." : contact.online ? "online" : "offline"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => onInitiateCall(contact, 'audio')}
            aria-label="Start audio call"
            title="Start audio call"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => onInitiateCall(contact, 'video')}
            aria-label="Start video call"
            title="Start video call"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="More options" title="More options">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                message.sent
                  ? 'bg-message-sent text-message-sent-foreground rounded-br-md'
                  : 'bg-message-received text-message-received-foreground rounded-bl-md'
              } shadow-sm`}
              style={{ boxShadow: 'var(--shadow-message)' }}
            >
              <p className="text-sm">{message.text}</p>
              <div className={`flex items-center justify-end mt-1 space-x-1 ${
                message.sent ? 'text-message-sent-foreground/70' : 'text-message-received-foreground/70'
              }`}>
                <span className="text-xs">{message.timestamp}</span>
                {message.sent && (
                  <div className="flex space-x-1">
                    <div className={`w-4 h-3 ${message.delivered ? 'text-current' : 'text-current/50'}`}>
                      <svg viewBox="0 0 16 12" fill="currentColor" className="w-full h-full">
                        <path d="M0.5 6L1.5 5L6 9.5L14.5 1L15.5 2L6 11.5L0.5 6Z"/>
                      </svg>
                    </div>
                    {message.read && (
                      <div className="w-4 h-3 text-current -ml-2">
                        <svg viewBox="0 0 16 12" fill="currentColor" className="w-full h-full">
                          <path d="M0.5 6L1.5 5L6 9.5L14.5 1L15.5 2L6 11.5L0.5 6Z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center space-x-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="h-10 w-10 p-0"
            aria-label="Send message"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
