type ChatSummary = {
  id: string;
  name: string;
  phoneNumber: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
};

type MessageDTO = {
  id: string;
  chatId: string;
  text: string;
  timestamp: string;
  sent: boolean;
  delivered: boolean;
  read: boolean;
  from: string;
  to: string;
};

type Listener<T = unknown> = (payload: T) => void;

type EventMap = {
  'chat:list': Listener<ChatSummary[]>;
  'chat:update': Listener<Record<string, ChatSummary>>; // { [viewerPhone]: ChatSummary }
  'message:new': Listener<MessageDTO>;
};

class WSClient {
  private ws: WebSocket | null = null;
  private listeners: Partial<Record<keyof EventMap, Set<Listener>>> = {};
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(phone: string, name?: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.send('auth', { phone, name });
    };
    this.ws.onmessage = (ev) => {
      try {
        const { type, payload } = JSON.parse(ev.data);
        this.emit(type as keyof EventMap, payload);
      } catch {
        // ignore invalid frame
      }
    };
    this.ws.onclose = () => {
      this.ws = null;
    };
  }

  on<K extends keyof EventMap>(event: K, cb: EventMap[K]) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(cb as Listener);
    return () => this.listeners[event]!.delete(cb as Listener);
  }

  private emit<K extends keyof EventMap>(type: K, payload: Parameters<EventMap[K]>[0]) {
    const set = this.listeners[type];
    if (!set) return;
    for (const cb of set) cb(payload);
  }

  send(type: string, payload?: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  sendMessage(to: string, text: string) {
    this.send('message:send', { to, text });
  }

  openChat(withPhone: string) {
    this.send('chat:open', { withPhone });
  }
}

// Vite typing for import.meta.env isn't available in this file without the shim.
// We safely fallback to localhost when VITE_WS_URL is not defined.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env as Record<string, string | undefined>;
const WS_URL: string = env.VITE_WS_URL || 'ws://localhost:3001';
export const wsClient = new WSClient(WS_URL);
