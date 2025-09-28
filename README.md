# Xe Chat — Xenova Labs Ltd

Xe Chat is a modern messaging UI by Xenova Labs Ltd, built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui. It includes a chat list, chat window with delivery/read indicators, phone-based auth UI, contact management, and a call overlay. A lightweight WebSocket dev server is included for local real‑time messaging.

## Features

- Phone-number auth flow (demo stub)
- Chat list with unread counts and presence badge
- Chat window with sent/delivered/read states and keyboard send
- Audio/Video call overlay (simulated)
- Contact add flow with country code selector
- LocalStorage persistence for last selected view/chat

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Radix UI
- TanStack Query

## Architecture

- Frontend: React + Vite app in `src/`
- Realtime (dev): minimal WebSocket server in `server/`
- Styling: Tailwind CSS + shadcn/ui (Radix primitives)

## Getting Started

Prerequisites: Node.js 18+ and npm 9+ (or bun/pnpm/yarn).

Run the realtime server and the frontend in two terminals:

Terminal A (WebSocket server):

```bash
cd server
npm i
npm start
```

Terminal B (frontend):

```bash
npm i
npm run dev
```

Open http://localhost:8080

Optional: configure the WS URL for the frontend with `VITE_WS_URL` (defaults to `ws://localhost:3001`).

```bash
VITE_WS_URL=ws://localhost:3001 npm run dev
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run build:dev` — Development-mode build bundle
- `npm run preview` — Preview production build
- `npm run lint` — Lint the codebase

## Notes

Auth and calling are demo UIs. Replace stubs with real services for production (e.g., Firebase/Twilio for phone auth; WebRTC + TURN for calling).

## Company

Xenova Labs Ltd builds practical, reliable software with a focus on user experience and developer ergonomics.

For inquiries: contact@xenovalabs.com

## License

All rights reserved © Xenova Labs Ltd
