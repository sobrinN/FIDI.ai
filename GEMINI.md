# FIDI.ai Project Context

**Version:** 0.4.4
**Last Updated:** 2025-12-16

## Project Overview

**FIDI.ai** is an enterprise-grade multi-agent AI platform designed to provide specialized intelligence through four distinct agents. The application leverages a modern **client-server architecture** to ensure security, performance, and scalability.

- **Purpose**: A unified interface for interacting with specialized AI agents (Software Architecture, Creative Writing, Task Management, and Visual Generation).
- **Core Tech Stack**:
  - **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion
  - **Backend**: Node.js, Express, TypeScript
  - **AI Integration**: OpenRouter (Grok, Claude, GPT) and Replicate (Image/Video generation)

## Architecture

The project is split into two distinct parts that must run simultaneously:

### 1. Client (Frontend)
- **Location**: Root directory (`/`)
- **Framework**: React 19 + Vite
- **Key Features**:
  - View-based state management (Landing, Auth, Chat, Agents)
  - Real-time SSE streaming responses
  - Neural network visual effects (`NeuralBackground`, `NeuralPlanet`)
  - Code splitting with lazy-loaded components
  - **No Global CSS**: Styling via Tailwind utility classes

### 2. Server (Backend)
- **Location**: `/server` directory
- **Framework**: Express + TypeScript
- **Key Features**:
  - Secure API proxy (OpenRouter, Replicate keys server-side)
  - JWT authentication with 7-day expiry
  - Rate limiting (API, AI, Auth routes)
  - Model allowlist validation
  - **Security**: API keys stored in `server/.env`, never exposed to client

## Key Commands

### Setup & Installation
```bash
# 1. Install Frontend Dependencies
npm install

# 2. Install Backend Dependencies
cd server && npm install
```

### Running the Application
You must run **two** separate terminals:

**Terminal 1 (Backend)**
```bash
cd server
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 (Frontend)**
```bash
npm run dev
# Runs on http://localhost:3000
```

### Testing
```bash
npm run test           # Run all tests
npm run test:ui        # Run with UI
npm run test:coverage  # Check coverage
```

### Building
```bash
npm run build          # Build frontend
cd server && npm run build  # Build backend
```

## Project Structure

```text
/
├── components/             # React UI components
│   ├── ChatInterface.tsx   # Core chat logic (815 lines)
│   ├── AgentsPage.tsx      # Agent selection
│   ├── Auth.tsx            # Authentication forms
│   ├── ErrorBoundary.tsx   # Error handling
│   └── ...
├── config/                 # App-wide configuration
│   ├── agents.ts           # Agent definitions (Prompts, Models)
│   └── constants.ts        # Global constants
├── hooks/                  # Custom React hooks
│   ├── useConversations.ts # Conversation management
│   ├── useFileAttachments.ts # File upload handling
│   └── useAutoScroll.ts    # Smart scrolling
├── lib/                    # Utility libraries
│   ├── apiClient.ts        # Frontend API client
│   ├── storageUtils.ts     # Type-safe localStorage
│   └── ...
├── server/                 # Backend application
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── config/         # Server configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── lib/            # Server utilities
│   └── .env                # Server secrets (API Keys)
├── CLAUDE.md               # Development guide
├── CHANGELOG.md            # Version history
├── README.md               # Quick start
└── GEMINI.md               # This file
```

## Development Conventions

### Code Style
- **Strict TypeScript**: All code with strict mode enabled
- **Functional Components**: React components use hooks
- **Tailwind CSS**: Utility classes; no CSS files
- **Path Aliases**: Use `@/` to refer to project root

### AI Agents Configuration

Agents defined in `config/agents.ts`:

| Agent | ID | Role | Model |
|-------|----|----|------|
| **FIDI** | 01 | Software Architecture | x-ai/grok-4.1-fast:free |
| **TUNIN** | 02 | Creative Writing | x-ai/grok-4.1-fast:free |
| **MORCEGO** | 03 | Task Management | x-ai/grok-4.1-fast:free |
| **NENECA** | 04 | Visual Generation | Grok + Replicate |

### Implementation Status

**Completed:**
- Phase 1-2: Security (JWT auth, API key isolation, XSS protection)
- Phase 3: Performance (Code splitting, lazy loading, memoization)
- v0.3.0: Documentation update, security hardening

**In Progress:**
- Phase 4: Type safety enhancements, code quality refactoring

**Planned:**
- Phase 5: Persistent database, state management, virtual scrolling

### Security Features
- Server-side API keys only
- JWT authentication (7-day expiry)
- bcrypt password hashing (10 rounds)
- DOMPurify XSS protection
- Rate limiting per route
- Model allowlist validation
- Helmet security headers

### Important Notes
- **Always check `CLAUDE.md`**: Contains detailed architecture and development instructions
- **No global CSS**: All styles are Tailwind utilities or inline
- **Server Dependency**: Frontend requires backend on port 3001
- **Environment Variables**: Copy `server/.env.example` to `server/.env`

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.4.4 | 2025-12-16 | Documentation cleanup, removed exposed API keys |
| 0.4.1 | 2025-12-15 | Race condition fixes, TypeScript improvements |
| 0.4.0 | 2025-12-13 | Token quota system, model selector |
| 0.3.0 | 2025-12-09 | Documentation update, security hardening |
| 0.2.0 | 2025-12-05 | Backend server, JWT auth, rate limiting |
| 0.1.x | 2025-11-29 | Initial release, core features |

See [CHANGELOG.md](./CHANGELOG.md) for complete history.

---

**Built by FIDI.ai Team** | v0.4.4
