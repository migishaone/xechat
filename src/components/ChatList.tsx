import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

export const ChatList = ({ chats, selectedChatId, onChatSelect }: ChatListProps) => {
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Xe Chat</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-accent ${
              selectedChatId === chat.id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {chat.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-online-indicator rounded-full border-2 border-card"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};