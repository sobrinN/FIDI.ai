# FIDI.ai - Multi-Model AI Chat & Media Canvas Platform

**Version 1.0.0** | Modern AI platform built with React 19, TypeScript, and Express.

> Chat with efficient LLMs from multiple providers, and generate images/videos using a node-based canvas.

## ✨ Features

### 🤖 Multi-Model LLM Chat
- **7 AI Models** from Google, X.AI, Anthropic, OpenAI, DeepSeek, and MiniMax
- Real-time streaming responses via SSE
- Model selection per conversation
- FREE and PAID tiers with token cost multipliers

### 🎨 Media Canvas
- **Node-based workspace** using @xyflow/react
- **5 Image Models**: FLUX 2 Pro, FLUX 2 Dev, Qwen Image, Qwen Edit Plus, Seedream 4.5
- **3 Video Models**: WAN Animate Replace, WAN i2v Fast, Hailuo 02 Fast
- Configurable aspect ratios, resolutions, and durations
- Drag, connect, and arrange nodes freely

### 💳 Token Credit System
- FREE users: 1M credits | PRO users: 10M credits
- Model-based cost multipliers (1.5x standard, 2.0x premium)
- Real-time balance display

### 🔒 Security
- Server-side API keys (OpenRouter + Replicate)
- JWT authentication with HTTP-only cookies
- Rate limiting and model allowlist
- XSS protection via DOMPurify

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [OpenRouter API key](https://openrouter.ai)
- [Replicate API key](https://replicate.com) (for media generation)

### Installation

```bash
# Clone repository
git clone https://github.com/sobrinN/FIDI.ai
cd FIDI.ai

# Install dependencies
npm install
cd server && npm install && cd ..

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your API keys
```

### Running

```bash
# Terminal 1: Backend (http://localhost:3001)
cd server && npm run dev

# Terminal 2: Frontend (http://localhost:3000)
npm run dev
```

Open **http://localhost:3000** in your browser.

## 📁 Project Structure

```
FIDI.ai/
├── components/              # React UI components
│   ├── ChatInterface.tsx    # Chat with model selector
│   ├── ModelSelector.tsx    # LLM model dropdown
│   ├── canvas/              # Media Canvas
│   │   ├── MediaCanvas.tsx  # Node-based workspace
│   │   └── nodes/           # ImageNode, VideoNode
│   └── ...                  # Auth, Navbar, Landing page
├── config/
│   ├── models.ts            # LLM model definitions
│   └── mediaModels.ts       # Image/video models
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities
├── server/                  # Express backend
│   ├── src/routes/          # API endpoints
│   └── src/lib/             # Token service, user storage
└── App.tsx                  # Main application
```

## ⚙️ Configuration

### Backend (`server/.env`)
```
OPENROUTER_API_KEY=sk-or-v1-...
REPLICATE_API_KEY=r8_...
JWT_SECRET=your-secret-min-32-chars
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:3001
```

## 🤖 Available Models

### Chat Models
| Model | Provider | Tier | Cost |
|-------|----------|------|------|
| Devstral 2512 | Mistral AI | FREE | 0x |
| Gemini 3 Flash | Google | PAID | 1.5x |
| Grok Code Fast 1 | X.AI | PAID | 1.5x |
| GPT OSS 120B | OpenAI | PAID | 1.5x |
| DeepSeek V3.2 | DeepSeek | PAID | 1.5x |
| MiniMax M2 | MiniMax | PAID | 1.5x |
| Claude Sonnet 4.5 | Anthropic | PAID | 2.0x |

### Media Models (Canvas)
| Type | Model | Provider |
|------|-------|----------|
| Image | FLUX 2 Pro/Dev | Black Forest Labs |
| Image | Qwen Image/Edit Plus | Qwen |
| Image | Seedream 4.5 (4K) | Bytedance |
| Video | WAN Animate/i2v | WAN Video |
| Video | Hailuo 02 Fast | MiniMax |

## 🛠️ Commands

```bash
# Development
npm run dev                    # Frontend
cd server && npm run dev       # Backend

# Build
npm run build                  # Frontend
cd server && npm run build     # Backend

# Test
npm test                       # Run tests
npm run test:coverage          # Coverage report
```

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide & architecture
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [SECURITY.md](./SECURITY.md) - Security implementation

## 📄 License

MIT

---

**Built by FIDI.ai Team** | v1.0.0
