# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Version:** 1.0.0
**Last Updated:** 2025-12-23

## Project Overview

FIDI.ai is a modern AI platform built with React 19, TypeScript, and Express. It provides two core features:

1. **Multi-Model LLM Chat**: A chat interface where users can interact with various efficient AI models from providers like Google, X.AI, Anthropic, OpenAI, DeepSeek, and MiniMax.

2. **Media Canvas**: A node-based workspace using @xyflow/react for generating images and videos through draggable, connectable nodes powered by Replicate models.

The platform includes a comprehensive token-based credit system and industrial-themed UI design.

## Development Commands

```bash
# Install dependencies
npm install                              # Frontend
cd server && npm install && cd ..        # Backend

# Development (requires two terminals)
cd server && npm run dev                 # Backend: http://localhost:3001
npm run dev                              # Frontend: http://localhost:3000

# Production build
npm run build
cd server && npm run build

# Testing
npm test
npm run test:coverage

# Type checking
npx tsc --noEmit                         # Frontend
cd server && npx tsc --noEmit            # Backend
```

## Environment Configuration

**Backend** (`server/.env`):
```
OPENROUTER_API_KEY=sk-or-v1-...
REPLICATE_API_KEY=r8_...
JWT_SECRET=your-secret-min-32-chars
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

**Frontend** (`.env.local` - optional):
```
VITE_API_URL=http://localhost:3001
```

## Architecture

```
Frontend (React 19 + Vite)              Backend (Express + TypeScript)
┌─────────────────────────────┐         ┌─────────────────────────────┐
│ Landing Page                │         │ /api/auth (JWT)             │
│ Auth (Login/Register)       │  ────►  │ /api/chat/stream (SSE)      │
│ Chat Interface + Models     │  ◄────  │ /api/media (images/videos)  │
│ Media Canvas (Nodes)        │         │ /api/admin                  │
│ Token Balance Display       │         └─────────────────────────────┘
└─────────────────────────────┘                     │
           │                                        ▼
           ▼                            ┌─────────────────────────────┐
   localStorage                         │ External APIs               │
   (Sessions, Conversations)            │ - OpenRouter (LLM models)   │
                                        │ - Replicate (Media models)  │
                                        └─────────────────────────────┘
```

## Project Structure

```
/
├── components/                      # React UI components
│   ├── ChatInterface.tsx            # Main chat with model selector
│   ├── ChatMessage.tsx              # Individual message rendering
│   ├── ModelSelector.tsx            # LLM model selection dropdown
│   ├── TokenBalance.tsx             # Credit display widget
│   ├── Auth.tsx                     # Login/registration forms
│   ├── PlanUpgradeModal.tsx         # Upgrade from Free to Pro
│   ├── canvas/                      # Media Canvas components
│   │   ├── MediaCanvas.tsx          # Node-based canvas (@xyflow/react)
│   │   ├── CanvasToolbar.tsx        # Add image/video nodes
│   │   └── nodes/
│   │       ├── ImageNode.tsx        # Image generation node
│   │       └── VideoNode.tsx        # Video generation node
│   └── ...                          # Landing page components
├── config/
│   ├── models.ts                    # LLM model definitions (FREE/PAID)
│   ├── mediaModels.ts               # Image & video model configs
│   └── constants.ts                 # Global constants
├── hooks/
│   ├── useConversations.ts          # Chat state management
│   ├── useAutoScroll.ts             # Smart scroll behavior
│   └── useFileAttachments.ts        # File upload handling
├── lib/
│   ├── apiClient.ts                 # Frontend API calls
│   ├── storageUtils.ts              # localStorage utilities
│   └── errorTypes.ts                # Error classification
├── server/
│   ├── src/
│   │   ├── index.ts                 # Express entry point
│   │   ├── config/
│   │   │   ├── allowedModels.ts     # Model allowlist & tiers
│   │   │   └── fallbackConfig.ts    # Model fallback chains
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── tokenQuota.ts        # Credit pre-checks
│   │   │   └── rateLimiter.ts       # Rate limiting
│   │   ├── routes/
│   │   │   ├── auth.ts              # Auth endpoints
│   │   │   ├── chat.ts              # SSE streaming chat
│   │   │   ├── media.ts             # Image/video generation
│   │   │   └── admin.ts             # Token management
│   │   └── lib/
│   │       ├── tokenService.ts      # Credit operations
│   │       ├── userStorage.ts       # User persistence
│   │       └── modelAdapters.ts     # Provider-specific formatting
│   └── data/users.json              # User database (git-ignored)
├── App.tsx                          # Main application shell
├── types.ts                         # Global TypeScript interfaces
├── index.css                        # Global styles
└── vite.config.ts                   # Vite configuration
```

## Available LLM Models

### FREE Tier (No credit cost)
| Model | Provider | Description |
|-------|----------|-------------|
| Devstral 2512 | Mistral AI | Lightweight development model |

### PAID Tier (Credit multipliers)
| Model | Provider | Cost | Description |
|-------|----------|------|-------------|
| Gemini 3 Flash | Google | 1.5x | Fast reasoning |
| Grok Code Fast 1 | X.AI | 1.5x | Code generation |
| GPT OSS 120B | OpenAI | 1.5x | Large reasoning |
| DeepSeek V3.2 | DeepSeek | 1.5x | Analytical tasks |
| MiniMax M2 | MiniMax | 1.5x | Speed/quality balance |
| Claude Sonnet 4.5 | Anthropic | 2.0x | Complex multi-modal |

## Media Models (Canvas)

### Image Generation (Replicate)
| Model | Provider | Speed |
|-------|----------|-------|
| FLUX 2 Pro | Black Forest Labs | PRO |
| FLUX 2 Dev | Black Forest Labs | FAST |
| Qwen Image | Qwen | PRO |
| Qwen Edit Plus | Qwen | PRO |
| Seedream 4.5 | Bytedance | PRO (up to 4K) |

### Video Generation (Replicate)
| Model | Provider | Speed |
|-------|----------|-------|
| WAN Animate Replace | WAN Video | PRO |
| WAN i2v Fast | WAN Video | FAST |
| Hailuo 02 Fast | MiniMax | FAST |

## Token/Credit System

**Allocations:**
- FREE users: 1,000,000 credits
- PRO users: 10,000,000 credits

**Cost Multipliers:**
- FREE models: 0x (unlimited)
- Standard PAID models: 1.5x
- Claude Sonnet 4.5: 2.0x

**Media Costs:**
- Image generation: 5,000 credits
- Video generation: 20,000 credits

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | Login with JWT |
| `/api/auth/me` | GET | Current user info |
| `/api/auth/logout` | POST | Logout |
| `/api/chat/stream` | POST | SSE streaming chat |
| `/api/media/image` | POST | Image generation |
| `/api/media/video` | POST | Video generation |
| `/api/admin/tokens/*` | GET/POST | Token management |

## Key Implementation Details

### Chat Flow
1. User selects a model from `ModelSelector`
2. Message sent to `/api/chat/stream` with SSE
3. Backend routes to OpenRouter with model adapter
4. Tokens streamed back in real-time
5. Credits deducted based on model multiplier

### Canvas Flow
1. User adds Image/Video nodes via `CanvasToolbar`
2. Configure prompt, model, aspect ratio in node
3. Generation request sent to `/api/media/*`
4. Result URL displayed in node
5. Nodes can be connected and arranged freely

### UI Design System
- **Theme**: Industrial minimalist (silver/gray + orange accents)
- **Fonts**: Outfit (sans), JetBrains Mono (mono)
- **Background**: Light (#F0F0F0)
- **Accent**: Orange (#ff6D00)
- **Canvas nodes**: White with black borders

## Security

- API keys stored server-side only
- JWT authentication (7-day expiry)
- bcrypt password hashing (10 rounds)
- DOMPurify XSS sanitization
- Rate limiting per route
- Model allowlist enforcement
- File-locked user storage

## Running the Application

**Two terminals required:**

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev
```

Open http://localhost:3000 in your browser.

**Common Issues:**
- "Failed to fetch" → Backend not running on port 3001
- "Insufficient credits" → User balance too low (HTTP 402)
- "Invalid model" → Model not in allowlist
