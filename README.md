# FIDI.ai - Multi-Agent AI Platform

**Version 0.3.0** | Enterprise-grade multi-agent AI platform built with React 19, TypeScript, and Express.

Features 4 specialized AI agents powered by OpenRouter (Grok) and Replicate APIs with secure backend architecture.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenRouter API key: https://openrouter.ai
- Replicate API key (optional): https://replicate.com

### Installation

```bash
# Clone and install
git clone <repository-url>
cd FIDI.ai

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your API keys
```

### Running

**Two terminals required:**

```bash
# Terminal 1: Backend (http://localhost:3001)
cd server && npm run dev

# Terminal 2: Frontend (http://localhost:3000)
npm run dev
```

Open http://localhost:3000 in your browser.

## Architecture

```
Frontend (React 19 + Vite)     Backend (Express + TypeScript)
┌─────────────────────┐        ┌─────────────────────┐
│ Landing Page        │        │ /api/auth           │
│ Authentication      │  ───►  │ /api/chat (SSE)     │
│ Chat Interface      │  ◄───  │ /api/media          │
│ Agent Selection     │        │                     │
└─────────────────────┘        └─────────────────────┘
         │                              │
         ▼                              ▼
   localStorage               OpenRouter / Replicate
   (Sessions, Chats)          (Server-side API keys)
```

## Features

### AI Agents

| Agent | Role | Specialization |
|-------|------|----------------|
| **FIDI** | CORE / DEV | Software architecture, clean code |
| **TUNIN** | COPY / TEXT | Copywriting, creative writing |
| **MORCEGO** | SYS / ORG | Task management, organization |
| **NENECA** | DESIGN / VIS | Image & video generation |

### Security
- API keys server-side only
- JWT authentication (7-day expiry)
- bcrypt password hashing
- DOMPurify XSS protection
- Rate limiting
- Model allowlist

### Performance
- Code splitting (-70% bundle)
- Lazy-loaded components
- SSE streaming (2-min timeout)
- Error boundaries

## Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

**Backend:**
- Express.js
- TypeScript
- OpenRouter SDK
- JWT / bcryptjs
- Helmet / CORS

## Configuration

### Backend (`server/.env`)
```
OPENROUTER_API_KEY=sk-or-v1-...
REPLICATE_API_KEY=r8_...
JWT_SECRET=your-secret-min-32-chars
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Frontend (`.env.local` - optional)
```
VITE_API_URL=http://localhost:3001
```

## Commands

```bash
# Development
npm run dev           # Start frontend
cd server && npm run dev  # Start backend

# Build
npm run build         # Build frontend
cd server && npm run build  # Build backend

# Test
npm test              # Run tests
npm run test:coverage # Coverage report
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide & architecture
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) - Development phases

## License

MIT

---

**Built by FIDI.ai Team** | v0.3.0
