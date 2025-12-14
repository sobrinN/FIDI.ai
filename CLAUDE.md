# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Version:** 0.4.0
**Last Updated:** 2025-12-13

## Project Overview

FIDI.ai is an enterprise-grade multi-agent AI platform built with React 19, TypeScript, and Express. It features a futuristic landing page with JWT authentication and a chat interface where users interact with 4 specialized AI agents powered by OpenRouter (Grok) and Replicate APIs.

## Development Commands

### Setup and Development
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Start backend server (Terminal 1)
cd server && npm run dev

# Start frontend dev server (Terminal 2)
npm run dev

# Build for production
npm run build

# Run tests
npm test
npm run test:coverage
```

### Environment Configuration

**IMPORTANT**: This project uses a **client-server architecture** with a secure backend proxy.

**Backend Configuration** (`server/.env`):
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
REPLICATE_API_KEY=your_replicate_api_key_here
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

**Frontend Configuration** (`.env.local` - optional):
```
VITE_API_URL=http://localhost:3001
```

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FIDI.ai Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React 19 + Vite)          Backend (Express + TS)     │
│  ┌─────────────────────────┐         ┌─────────────────────┐    │
│  │ Landing Page            │         │ API Server          │    │
│  │ Auth (Login/Register)   │  ────►  │ /api/auth           │    │
│  │ Chat Interface          │  SSE    │ /api/chat           │    │
│  │ Agent Selection         │  ◄────  │ /api/media          │    │
│  └─────────────────────────┘         └─────────────────────┘    │
│            │                                   │                 │
│            ▼                                   ▼                 │
│  ┌─────────────────────────┐         ┌─────────────────────┐    │
│  │ localStorage            │         │ OpenRouter API      │    │
│  │ - Sessions              │         │ Replicate API       │    │
│  │ - Conversations         │         │ (Server-side keys)  │    │
│  └─────────────────────────┘         └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Core Application Flow

The app uses a view-based state system (`App.tsx`):
- **landing**: Marketing landing page with Hero, Features, Value Proposition sections
- **auth**: Login/registration interface with JWT authentication
- **chat**: Main chat interface where users interact with AI agents
- **agents**: Agent showcase/selection page

View transitions are handled by Framer Motion with blur/scale animations.

### Multi-Agent System

Four specialized agents configured in `config/agents.ts`:

| Agent | ID | Model | Role |
|-------|----|----|------|
| **FIDI** | 01 | x-ai/grok-4.1-fast:free | Software architecture, clean code, system design |
| **TUNIN** | 02 | x-ai/grok-4.1-fast:free | Copywriting, scripts, creative writing |
| **MORCEGO** | 03 | x-ai/grok-4.1-fast:free | Task management, document processing, data organization |
| **NENECA** | 04 | x-ai/grok-4.1-fast:free + Replicate | Visual generation (images and videos) |

**Agent-Specific Behaviors:**
- All agents use Grok models for text-based responses
- NENECA detects keywords (imagem, vídeo, picture, image, video) and routes to Replicate API
- Each agent has a unique system prompt defining personality and expertise

### Project Structure

```
/
├── components/                 # React UI components
│   ├── ChatInterface.tsx       # Main chat UI (815 lines)
│   ├── AgentsPage.tsx          # Agent selection/showcase
│   ├── Auth.tsx                # Login/registration forms
│   ├── NeuralBackground.tsx    # Animated background effect
│   ├── MarkdownRenderer.tsx    # Markdown display for AI responses
│   ├── ErrorBoundary.tsx       # React error boundary
│   ├── LoadingSpinner.tsx      # Loading indicator
│   └── ...                     # Landing page components
├── config/                     # Application configuration
│   ├── agents.ts               # Agent definitions (prompts, models, icons)
│   └── constants.ts            # Global constants (timeouts, limits)
├── hooks/                      # Custom React hooks
│   ├── useConversations.ts     # Conversation state management
│   ├── useFileAttachments.ts   # File upload handling
│   └── useAutoScroll.ts        # Smart auto-scrolling
├── lib/                        # Utility libraries
│   ├── apiClient.ts            # Frontend API client
│   ├── storageUtils.ts         # Type-safe localStorage
│   ├── historyUtils.ts         # Message format conversion
│   ├── migration.ts            # Data migrations
│   └── agentUtils.ts           # Agent helpers
├── test/                       # Test files
│   └── integration/            # Integration tests
├── server/                     # Backend application
│   ├── src/
│   │   ├── index.ts            # Express server entry point
│   │   ├── config/
│   │   │   └── allowedModels.ts # Model allowlist
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT authentication
│   │   │   ├── errorHandler.ts # Error handling
│   │   │   └── rateLimiter.ts  # Rate limiting
│   │   ├── routes/
│   │   │   ├── auth.ts         # Auth endpoints
│   │   │   ├── chat.ts         # Chat streaming
│   │   │   └── media.ts        # Image/video generation
│   │   └── lib/
│   │       ├── modelAdapters.ts # Model-specific formatting
│   │       └── userStorage.ts  # User persistence
│   ├── package.json
│   └── .env                    # Server secrets (git-ignored)
├── App.tsx                     # Main app shell
├── index.tsx                   # React entry point
├── types.ts                    # Global TypeScript interfaces
├── package.json                # Frontend dependencies
├── vite.config.ts              # Vite configuration
├── CLAUDE.md                   # This file
├── CHANGELOG.md                # Version history
└── README.md                   # Quick start guide
```

### State Management

**User Sessions:**
- Stored in `localStorage` as `fidi_session`
- JWT token stored as HTTP-only cookie `auth_token`
- 7-day token expiration

**Conversations:**
- Stored in `localStorage` as `fidi_conversations_{userId}`
- Each conversation tied to specific agent via `agentId` field
- Messages support text, attachments (base64), and generated media

**Type Definitions** (`types.ts`):
```typescript
User { id, name, email }
Message { id, role, content, timestamp?, attachments?, media? }
Conversation { id, title, messages, lastModified, agentId, createdAt?, updatedAt? }
Attachment { name, type, data, size? }
GeneratedMedia { type: 'image' | 'video', url, mimeType, prompt? }
```

### API Integration

**Backend Routes:**
- `POST /api/auth/register` - User registration (bcrypt hashing)
- `POST /api/auth/login` - Login with JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/chat/stream` - SSE streaming chat (protected)
- `POST /api/media/image` - Image generation via Replicate (protected)
- `POST /api/media/video` - Video generation via Replicate (protected)
- `GET /api/health` - Health check

**Rate Limiting:**
- API General: 100 requests / 15 minutes
- AI Operations: 20 requests / 1 minute
- Auth: 5 attempts / 15 minutes
- Registration: 10 attempts / 15 minutes

**Model Allowlist** (`server/src/config/allowedModels.ts`):
- Google: gemini-flash-1.5, gemini-pro-1.5
- Anthropic: claude-sonnet-4.5, claude-3.5-sonnet, claude-3-opus
- X.AI: grok-4.1-fast:free, grok-beta
- OpenAI: gpt-4-turbo, gpt-3.5-turbo

### Styling & Design System

- **Tailwind CSS**: Loaded via CDN (configured in `index.html`)
- **No CSS Files**: All styling via Tailwind utility classes
- **Fonts**:
  - Outfit (sans)
  - Space Grotesk (display)
  - JetBrains Mono (mono)
  - Michroma (brand)
- **Color Palette**:
  - Background: Pure black (#000000)
  - Accent: Blue (#3B82F6)
  - Agent colors: blue, purple, emerald, pink
- **Visual Effects**: Glass-morphism (`.glass-panel`), neural network animations

### Security Features

1. **Server-Side API Keys**: OpenRouter/Replicate keys never exposed to browser
2. **JWT Authentication**: 7-day expiry, HTTP-only cookies
3. **Password Hashing**: bcryptjs with 10 salt rounds
4. **XSS Protection**: DOMPurify sanitization on all user inputs
5. **Input Validation**: Message length limits (32KB), file size limits (10MB)
6. **Rate Limiting**: Per-route rate limits to prevent abuse
7. **Model Allowlist**: Prevents unauthorized model usage
8. **Security Headers**: Helmet middleware with CSP
9. **CORS**: Properly configured for credential handling

### Performance Optimizations

1. **Code Splitting**: Lazy-loaded components (ChatInterface, Auth, AgentsPage)
2. **Vendor Chunks**: Separated bundles (react, ui, markdown, utils)
3. **Error Boundaries**: Prevent full-app crashes
4. **Memoization**: useCallback/useMemo for expensive operations
5. **Smart Scrolling**: Auto-scroll only when user is near bottom
6. **Streaming**: SSE for real-time chat responses (120s timeout)
7. **Retry Logic**: Exponential backoff for failed requests

### Constants Reference (`config/constants.ts`)

```typescript
TIMEOUTS: {
  STREAM: 120000,        // 2 minutes
  PREDICTION_POLL: 2000, // 2 seconds
  PREDICTION_MAX: 60,    // Max poll attempts
  ABORT_TIMEOUT: 60000   // 1 minute
}

FILE_LIMITS: {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
}

MESSAGE_LIMITS: {
  MAX_MESSAGES_PER_CONVERSATION: 1000,
  MAX_MESSAGE_LENGTH: 32000
}

AGENT_IDS: ['01', '02', '03', '04']
VIEWS: ['landing', 'auth', 'chat', 'agents']
```

## Running the Application

**CRITICAL**: The application requires BOTH frontend and backend servers running:

1. **Backend Server** (Terminal 1):
   ```bash
   cd server && npm run dev
   ```
   - Runs on http://localhost:3001
   - Handles all API requests
   - Manages API keys securely

2. **Frontend Server** (Terminal 2):
   ```bash
   npm run dev
   ```
   - Runs on http://localhost:3000
   - React app that communicates with backend

**Common Issues:**
- "Failed to fetch" → Backend server not running on port 3001
- "Authentication required" → JWT token expired, re-login needed
- "Invalid model" → Model not in allowlist

## Important Development Notes

### Path Aliases
- `@/*` resolves to the root directory (configured in `tsconfig.json` and `vite.config.ts`)

### Component Patterns
- Functional components with hooks
- Framer Motion for animations
- AnimatePresence for enter/exit transitions
- Reveal.tsx for scroll-triggered animations

### Testing
```bash
npm run test          # Run all tests
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

### Git Workflow
- Main branch: `main`
- Feature branches: `feature/*`
- Fix branches: `fix/*`
- Always run tests before committing

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.
