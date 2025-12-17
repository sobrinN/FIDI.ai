# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Version:** 0.4.5
**Last Updated:** 2025-12-16

## Project Overview

FIDI.ai is an enterprise-grade multi-agent AI platform built with React 19, TypeScript, and Express. It features a futuristic landing page with JWT authentication and a chat interface where users interact with 4 specialized AI agents powered by OpenRouter and Replicate APIs. The platform includes a comprehensive token quota system with FREE/PAID model tiers.

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

# Type checking
npx tsc --noEmit                    # Frontend
cd server && npx tsc --noEmit       # Backend
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
│  ┌─────────────────────────┐         ┌─────────────────────────┐│
│  │ Landing Page            │         │ API Server              ││
│  │ Auth (Login/Register)   │  ────►  │ /api/auth               ││
│  │ Chat Interface          │  SSE    │ /api/chat (token check) ││
│  │ Agent Selection         │  ◄────  │ /api/media (quota)      ││
│  │ Token Balance Display   │         │ /api/admin              ││
│  │ Model Selector          │         └─────────────────────────┘│
│  └─────────────────────────┘                   │                │
│            │                                   ▼                │
│            ▼                         ┌─────────────────────────┐│
│  ┌─────────────────────────┐         │ File-based Storage      ││
│  │ localStorage            │         │ - users.json (locked)   ││
│  │ - Sessions              │         │ - Atomic writes         ││
│  │ - Conversations         │         │ - Stale lock cleanup    ││
│  └─────────────────────────┘         └─────────────────────────┘│
│                                                │                │
│                                                ▼                │
│                                      ┌─────────────────────────┐│
│                                      │ External APIs           ││
│                                      │ - OpenRouter (LLM)      ││
│                                      │ - Replicate (Media)     ││
│                                      └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Core Application Flow

The app uses a view-based state system (`App.tsx`):
- **landing**: Marketing landing page with Hero, Features, Value Proposition sections
- **auth**: Login/registration interface with JWT authentication
- **chat**: Main chat interface where users interact with AI agents
- **agents**: Agent showcase/selection page

View transitions are handled by Framer Motion with blur/scale animations.

**Session Management:**
- Session verification on app mount via `/api/auth/me`
- Intended view tracking for post-login redirect
- Loading state during session verification

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

### Token System

**Tier Structure:**
- **FREE**: Unlimited usage, no token deduction (costMultiplier = 0)
- **PAID**: 1.5x token cost multiplier on actual API usage
- **LEGACY**: Existing agent models with 1.0x multiplier

**Token Costs:**
- Chat: Dynamic based on actual API token usage × cost multiplier
- Image generation: 5,000 tokens
- Video generation: 20,000 tokens
- Default balance: 50,000 tokens (monthly reset)

**Pre-flight Checks:**
- Chat route requires minimum 100 tokens (skipped for FREE models)
- Media routes use `checkTokenQuota` middleware

### Project Structure

```
/
├── components/                 # React UI components
│   ├── ChatInterface.tsx       # Main chat UI with model selector
│   ├── AgentsPage.tsx          # Agent selection/showcase
│   ├── Auth.tsx                # Login/registration forms
│   ├── TokenBalance.tsx        # Real-time token display
│   ├── ModelSelector.tsx       # Model selection dropdown
│   ├── NeuralBackground.tsx    # Animated background effect
│   ├── MarkdownRenderer.tsx    # Lazy-loaded markdown display
│   ├── ErrorBoundary.tsx       # React error boundary
│   ├── Toast.tsx               # Notification component
│   ├── TrustSignals.tsx        # Landing page stats
│   └── ...                     # Other landing page components
├── config/                     # Application configuration
│   ├── agents.ts               # Agent definitions (prompts, models, icons)
│   ├── constants.ts            # Global constants (timeouts, limits)
│   └── models.ts               # Frontend model configuration
├── hooks/                      # Custom React hooks
│   ├── useConversations.ts     # Conversation state (memoized, race-safe)
│   ├── useFileAttachments.ts   # File upload handling
│   └── useAutoScroll.ts        # Smart auto-scrolling
├── lib/                        # Utility libraries
│   ├── apiClient.ts            # Frontend API client
│   ├── storageUtils.ts         # Type-safe localStorage
│   ├── historyUtils.ts         # Message format conversion
│   ├── migration.ts            # Data migrations
│   └── agentUtils.ts           # Agent helpers
├── test/                       # Test files
│   ├── setup.ts                # Test configuration
│   └── integration/            # Integration tests
├── server/                     # Backend application
│   ├── src/
│   │   ├── index.ts            # Express server entry point
│   │   ├── config/
│   │   │   └── allowedModels.ts # Model allowlist with tiers
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT authentication
│   │   │   ├── errorHandler.ts # Error handling
│   │   │   ├── rateLimiter.ts  # Rate limiting
│   │   │   └── tokenQuota.ts   # Token pre-flight checks
│   │   ├── routes/
│   │   │   ├── auth.ts         # Auth endpoints (async)
│   │   │   ├── chat.ts         # Chat streaming with token check
│   │   │   ├── media.ts        # Image/video generation
│   │   │   └── admin.ts        # Admin token management
│   │   └── lib/
│   │       ├── modelAdapters.ts # Model-specific formatting
│   │       ├── userStorage.ts  # File-locked user persistence
│   │       └── tokenService.ts # Token operations (async)
│   ├── data/                   # Persistent storage
│   │   ├── users.json          # User data (git-ignored)
│   │   └── locks/              # Lock files directory
│   ├── package.json
│   └── .env                    # Server secrets (git-ignored)
├── App.tsx                     # Main app shell with session verification
├── index.tsx                   # React entry point
├── types.ts                    # Global TypeScript interfaces (readonly)
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
- Session verified on mount via `/api/auth/me`

**Conversations:**
- Stored in `localStorage` as `fidi_conversations_{userId}`
- Each conversation tied to specific agent via `agentId` field
- Model locked per conversation via `modelId` field
- Messages support text, attachments (base64), and generated media
- Memoized lookups with `useMemo` for performance

**Type Definitions** (`types.ts`):
```typescript
User { id, name, email, tokenBalance?, tokenUsageThisMonth?, daysUntilReset? }
Message { id, role, content, timestamp?, attachments?, media? }
Conversation { id, title, messages, lastModified, agentId, modelId?, createdAt?, updatedAt? }
Attachment { name, type, data, size? }
GeneratedMedia { type: 'image' | 'video', url, mimeType, prompt? }
```

### API Integration

**Backend Routes:**
- `POST /api/auth/register` - User registration (bcrypt hashing)
- `POST /api/auth/login` - Login with JWT token
- `GET /api/auth/me` - Get current user with token stats (async)
- `POST /api/auth/logout` - Logout
- `POST /api/chat/stream` - SSE streaming chat (protected, token pre-check)
- `POST /api/media/image` - Image generation via Replicate (protected, quota)
- `POST /api/media/video` - Video generation via Replicate (protected, quota)
- `POST /api/admin/tokens/grant` - Grant tokens (admin only)
- `GET /api/admin/tokens/stats/:userId` - User token stats (admin only)
- `GET /api/admin/tokens/overview` - All users overview (admin only)
- `GET /api/health` - Health check

**Rate Limiting:**
- API General: 100 requests / 15 minutes
- AI Operations: 20 requests / 1 minute
- Auth: 5 attempts / 15 minutes
- Registration: 10 attempts / 15 minutes

**Model Allowlist** (`server/src/config/allowedModels.ts`):

FREE Models (unlimited, no deduction):
- `mistralai/devstral-2512:free`
- `kwaipilot/kat-coder-pro:free`
- `openai/gpt-oss-120b:free`
- `qwen/qwen3-coder:free`

PAID Models (1.5x multiplier):
- `openai/gpt-5.2`
- `anthropic/claude-sonnet-4.5`
- `anthropic/claude-opus-4.5`
- `google/gemini-3-pro-preview`
- `minimax/minimax-m2`
- `x-ai/glm-4.6`

LEGACY Models (1.0x multiplier):
- Google: `gemini-flash-1.5`, `gemini-pro-1.5`
- Anthropic: `claude-3.5-sonnet`, `claude-3-opus`
- X.AI: `grok-4.1-fast:free`, `grok-beta`
- OpenAI: `gpt-4-turbo`, `gpt-3.5-turbo`

**Model Adapters** (`server/src/lib/modelAdapters.ts`):
- X.AI/Grok: Prepends system prompt to first user message
- Anthropic/Claude: Standard system role
- OpenAI: Standard system role
- Google/Gemini: Standard system role
- Mistral: Standard system role
- Qwen: Standard system role
- MiniMax: Standard system role
- Kwaipilot: Standard system role

### File-based Storage (v0.4.4)

**User Storage** (`server/src/lib/userStorage.ts`):
- File locking with `users.lock` file
- Atomic writes via temp file + rename
- Stale lock cleanup (30 second timeout)
- Max 50 lock retries with 100ms delay
- All CRUD operations are async with file locking

**Key Functions (all async):**
```typescript
getUserByEmail(email: string): Promise<StoredUser | null>
getUserById(id: string): Promise<StoredUser | null>
emailExists(email: string): Promise<boolean>
createUser(user: StoredUser): Promise<StoredUser>
updateUser(id: string, updates: Partial<StoredUser>): Promise<StoredUser | null>
deleteUser(id: string): Promise<boolean>
migrateUserTokenFields(user: StoredUser): StoredUser  // Centralized migration
```

**Token Service** (`server/src/lib/tokenService.ts`):
- Uses centralized migration from userStorage
- Per-user file locking for operations
- Async operations throughout

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
10. **File Locking**: Prevents race conditions in user storage
11. **Token Pre-checks**: Validates balance before expensive operations
12. **Atomic Writes**: Prevents data corruption on crash

### Performance Optimizations

1. **Code Splitting**: Lazy-loaded components (ChatInterface, Auth, AgentsPage)
2. **Vendor Chunks**: Separated bundles (react, ui, markdown, utils)
3. **Error Boundaries**: Prevent full-app crashes
4. **Memoization**:
   - `useMemo` for current conversation lookup
   - `useCallback` for stable function references
5. **Smart Scrolling**: Auto-scroll only when user is near bottom
6. **Streaming**: SSE for real-time chat responses (120s timeout)
7. **Retry Logic**: Exponential backoff for failed requests
8. **Lazy Style Loading**: Syntax highlighter styles loaded on demand
9. **flushSync**: Guarantees state commits for new conversations

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

**Server Constants:**
```typescript
MIN_TOKENS_FOR_CHAT: 100        // Minimum balance to start chat
STALE_LOCK_MS: 30000            // 30 second lock timeout
LOCK_MAX_RETRIES: 50            // Max lock acquisition attempts
LOCK_RETRY_DELAY_MS: 100        // Delay between retries
DEFAULT_TOKEN_BALANCE: 50000    // Initial/reset balance
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
   - File-based user storage with locking

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
- "Insufficient tokens" → User balance too low (HTTP 402)
- "Failed to acquire lock" → Concurrent operation timeout

## Important Development Notes

### Path Aliases
- `@/*` resolves to the root directory (configured in `tsconfig.json` and `vite.config.ts`)

### Component Patterns
- Functional components with hooks
- Framer Motion for animations
- AnimatePresence for enter/exit transitions
- Reveal.tsx for scroll-triggered animations
- `flushSync` for critical synchronous state updates

### Async Patterns (v0.4.4)
All user storage and token operations are now async:
```typescript
// Example: Auth route
const user = await getUserByEmail(email);
await createUser(newUser);
const stats = await getUsageStats(userId);

// Example: Token operations
const balance = await getTokenBalance(userId);
const result = await deductTokens(userId, amount, reason, multiplier);
```

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
- Run `npx tsc --noEmit` to verify type safety

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## Recent Changes (v0.4.5)

### Replicate API Fix
- Fixed "version is required - Additional property model is not allowed" error
- Migrated to official Replicate models only (work with `/models/{owner}/{model}/predictions` endpoint)
- Removed non-official models that required version hashes

### NENECA Image Models (Official)
| Model | Speed | Price |
|-------|-------|-------|
| FLUX Schnell | Fast | ~$0.003 |
| SD 3.5 Large Turbo | Fast | ~$0.04 |
| FLUX 1.1 Pro | Best | ~$0.04 |

### Documentation Cleanup
- Deleted redundant markdown files (QUICKSTART.md, server/*.md)
- Fixed version inconsistencies across documentation
- Consolidated API documentation into CLAUDE.md

