# Xe Chat

A modern messaging UI built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui. It includes a chat list, chat window with delivery/read indicators, phone-based auth UI, contact management, and a simulated call interface.

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

## Getting Started

Prerequisites: Node.js 18+ and npm 9+ (or bun/pnpm/yarn).

```bash
npm i
npm run dev
```

Open http://localhost:8080

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run build:dev` — Development-mode build bundle
- `npm run preview` — Preview production build
- `npm run lint` — Lint the codebase

## Notes

This project uses mock data and simulated flows for demonstration. Replace stubs with real APIs for production use (auth, chat delivery, and calling).

## License

MIT
