import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3001;

// In-memory stores (dev/demo only)
const users = new Map(); // phone -> { phone, name, ws }
const chats = new Map(); // chatId -> { id, a, b, messages: [] }

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({ server: httpServer });

const send = (ws, type, payload) => {
  try {
    ws.send(JSON.stringify({ type, payload }));
  } catch {}
};

const broadcastTo = (phones, type, payload) => {
  for (const phone of phones) {
    const u = users.get(phone);
    if (u?.ws && u.ws.readyState === u.ws.OPEN) {
      send(u.ws, type, payload);
    }
  }
};

const chatIdFor = (a, b) => [a, b].sort().join('|');

const chatSummary = (c, viewer) => {
  const other = c.a === viewer ? c.b : c.a;
  const last = c.messages[c.messages.length - 1];
  return {
    id: c.id,
    name: users.get(other)?.name || other,
    phoneNumber: other,
    lastMessage: last?.text || '',
    timestamp: last ? new Date(last.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    unreadCount: c.messages.filter(m => !m.readBy?.includes(viewer) && m.to === viewer).length,
    online: !!users.get(other),
  };
};

wss.on('connection', (ws) => {
  let me = null; // phone

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    const { type, payload } = msg || {};

    if (type === 'auth') {
      const { phone, name } = payload || {};
      if (!phone) return;
      me = String(phone);
      users.set(me, { phone: me, name: name || `User ${me.slice(-4)}`, ws });

      // send initial chat list
      const myChats = Array.from(chats.values()).filter(c => c.a === me || c.b === me);
      const summaries = myChats.map(c => chatSummary(c, me));
      send(ws, 'chat:list', summaries);
      return;
    }

    if (!me) return; // must auth first

    if (type === 'message:send') {
      const { to, text } = payload || {};
      if (!to || !text) return;
      const id = chatIdFor(me, to);
      let c = chats.get(id);
      if (!c) {
        c = { id, a: me, b: String(to), messages: [] };
        chats.set(id, c);
      }
      const message = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        chatId: id,
        from: me,
        to: String(to),
        text: String(text),
        ts: Date.now(),
        readBy: [me],
      };
      c.messages.push(message);

      const payloadOut = {
        id: message.id,
        chatId: id,
        text: message.text,
        timestamp: new Date(message.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: message.from === me,
        delivered: true,
        read: false,
        from: message.from,
        to: message.to,
      };
      broadcastTo([c.a, c.b], 'message:new', payloadOut);

      // update chat summaries
      broadcastTo([c.a, c.b], 'chat:update', {
        [c.a]: chatSummary(c, c.a),
        [c.b]: chatSummary(c, c.b),
      });
      return;
    }

    if (type === 'chat:open') {
      const { withPhone } = payload || {};
      const id = chatIdFor(me, String(withPhone));
      const c = chats.get(id);
      if (!c) return;
      // mark all messages to me as read
      for (const m of c.messages) {
        if (m.to === me) {
          m.readBy = Array.from(new Set([...(m.readBy || []), me]));
        }
      }
      broadcastTo([c.a, c.b], 'chat:update', {
        [c.a]: chatSummary(c, c.a),
        [c.b]: chatSummary(c, c.b),
      });
      return;
    }
  });

  ws.on('close', () => {
    if (me && users.get(me)?.ws === ws) {
      users.delete(me);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`WS server listening on :${PORT}`);
});

