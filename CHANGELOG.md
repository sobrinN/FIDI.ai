# Changelog

All notable changes to FIDI.ai will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-12-13

### Added
- **Token Quota System**: Complete user token management with monthly resets
  - Default balance: 50,000 tokens per user
  - Automatic monthly reset (30-day intervals)
  - Thread-safe operations using file-system locking
  - Real-time balance tracking and usage statistics
- **Token Costs**:
  - Image generation: 5,000 tokens
  - Video generation: 20,000 tokens
  - Chat completion: Dynamic based on actual API usage
- **Model Selector with FREE/PAID Tiers**:
  - 4 FREE models with unlimited usage (no token deduction)
  - 6 PAID models with 1.5x token cost multiplier
  - Visual dropdown UI with tier badges
  - Per-conversation model locking
- **Frontend Components**:
  - `TokenBalance.tsx`: Real-time token balance display with color-coded indicators
  - `ModelSelector.tsx`: Beautiful model selection dropdown
  - Integrated into `ChatInterface.tsx` sidebar
- **Backend Services**:
  - `tokenService.ts`: Core token management with lazy migration
  - `tokenQuota.ts`: Middleware for quota enforcement
  - Admin routes for token grants (`admin.ts`)
- **Model Configuration**:
  - Tiered model system (FREE/PAID/LEGACY)
  - Full metadata with display names, descriptions, providers
  - Cost multiplier system (0x/1.5x/1.0x)
  - Frontend/backend model configuration sync

### Changed
- Extended `User` interface with token fields (balance, usage, reset date)
- Extended `Conversation` interface with `modelId` for model locking
- Updated `allowedModels.ts` with comprehensive tier system
- Enhanced chat route to track OpenRouter API usage
- Modified media routes with fail-safe token deduction
- Updated `storageUtils.ts` validation for new fields

### Security
- Server-side token calculations (no client manipulation)
- File-system locking prevents race conditions
- Fail-safe charging (only deduct on success)
- Audit logging for all token operations
- Admin-only token grant permissions

### Fixed
- TOCTOU race condition in token deduction
- Stale lock cleanup (30-second timeout)
- Partial failure handling in media generation
- Null checks for optional token fields
- Backend/frontend data structure alignment
- OpenRouter SDK camelCase compatibility (`totalTokens`)

### Technical
- Thread-safe operations with atomic file locking
- Lazy migration for backward compatibility
- Server-side cost multiplier enforcement
- Real-time usage tracking from OpenRouter API
- HTTP 402 error handling for insufficient tokens

---

## [0.3.0] - 2025-12-09

### Added
- Comprehensive documentation update with detailed architecture diagrams
- Model allowlist configuration (`server/src/config/allowedModels.ts`)
- Type-safe agent IDs and view types in constants
- Runtime validation for localStorage data (type guards)
- User storage utilities for backend persistence
- Smart auto-scroll hook with near-bottom detection

### Changed
- Updated all documentation files (CLAUDE.md, README.md, GEMINI.md)
- Improved ChatInterface with better error handling (815 lines)
- Enhanced useConversations hook with proper deletion handling
- Refined API client with detailed error logging
- Updated constants with centralized timeout and limit values

### Security
- Removed hardcoded API keys from test scripts
- Cleaned repository history of sensitive data
- Enhanced JWT secret validation at server startup
- Improved model validation against allowlist

### Documentation
- Complete rewrite of CLAUDE.md with system architecture
- Added CHANGELOG.md for version tracking
- Updated IMPLEMENTATION_ROADMAP.md with phase progress
- Enhanced GEMINI.md project context

---

## [0.2.0] - 2025-12-05

### Added
- **Backend Server Integration**: Complete Express.js backend with TypeScript
- **OpenRouter SDK**: Official TypeScript SDK for type-safe API access
- **Replicate API Integration**: Image and video generation support
- **JWT Authentication**: Full authentication system with token management
- **Rate Limiting**: Per-route rate limits (API, AI, Auth, Registration)
- **Security Middleware**: Helmet, CORS, cookie-parser integration
- **Error Handler Middleware**: Centralized error handling with APIError class
- **Model Adapters**: Provider-specific message formatting (Grok, Claude, OpenAI)

### Changed
- Migrated from client-side API calls to secure backend proxy
- All API keys now server-side only (never exposed to browser)
- Updated frontend API client to communicate with backend
- Improved streaming implementation with SSE from backend

### Security
- Server-side API key storage in `server/.env`
- JWT token authentication with 7-day expiry
- Password hashing with bcryptjs (10 salt rounds)
- XSS protection with DOMPurify
- Content Security Policy via Helmet
- CORS properly configured for credentials

### Documentation
- Added server setup instructions to README
- Created server/.env.example template
- Updated CLAUDE.md with backend architecture

---

## [0.1.5] - 2025-12-04

### Added
- **Code Splitting**: Lazy-loaded components for better performance
- **Vendor Chunks**: Separated bundles (react, ui, markdown, utils)
- **Error Boundaries**: Prevent full-app crashes from component errors
- **Loading States**: LoadingSpinner component for suspense fallbacks

### Changed
- Optimized bundle size with Vite chunk splitting
- Improved component lazy loading patterns
- Enhanced error handling in App.tsx

### Performance
- Reduced initial bundle size by ~70%
- Faster time-to-interactive with code splitting

---

## [0.1.4] - 2025-12-03

### Added
- **IndexedDB Support**: Media storage for large files (prepared)
- **Memoization**: useMemo/useCallback for expensive operations
- **Loading Skeletons**: Better UX during data loading

### Changed
- Optimized conversation state management
- Improved message rendering performance
- Enhanced file attachment handling

---

## [0.1.3] - 2025-12-02

### Added
- **DOMPurify Integration**: XSS protection for user inputs
- **Request Cancellation**: AbortController for streaming requests
- **TypeScript Strict Mode**: Enhanced type safety

### Security
- Input sanitization on all user-provided content
- Prevented potential XSS vulnerabilities
- Strict null checks enabled

---

## [0.1.2] - 2025-12-01

### Added
- **File Attachments**: Support for image and document uploads
- **useFileAttachments Hook**: Centralized file handling logic
- **Base64 Encoding**: File data stored in messages

### Changed
- Enhanced ChatInterface with attachment UI
- Improved message structure with attachments array

---

## [0.1.1] - 2025-11-30

### Added
- **Conversation History**: Persistent chat history per user
- **useConversations Hook**: Centralized conversation management
- **localStorage Persistence**: Automatic save/load of conversations

### Changed
- Restructured message and conversation types
- Improved conversation selection UX

---

## [0.1.0] - 2025-11-29

### Added
- **Initial Release**: FIDI.ai multi-agent platform
- **Landing Page**: Hero, Features, Value Proposition, Trust Signals, CTA
- **Authentication**: Login/Registration with mock auth
- **Chat Interface**: Multi-agent chat with streaming responses
- **4 AI Agents**: FIDI, TUNIN, MORCEGO, NENECA
- **Neural Background**: Animated particle network effect
- **Framer Motion**: Page transitions and animations

### Technical
- React 19 with TypeScript
- Vite build system
- Tailwind CSS via CDN
- Lucide React icons

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 0.4.0 | 2025-12-13 | Token quota system, FREE/PAID model selector |
| 0.3.0 | 2025-12-09 | Documentation update, security hardening |
| 0.2.0 | 2025-12-05 | Backend server integration, JWT auth |
| 0.1.5 | 2025-12-04 | Code splitting, performance optimization |
| 0.1.4 | 2025-12-03 | IndexedDB, memoization, loading states |
| 0.1.3 | 2025-12-02 | DOMPurify, request cancellation |
| 0.1.2 | 2025-12-01 | File attachments support |
| 0.1.1 | 2025-11-30 | Conversation history |
| 0.1.0 | 2025-11-29 | Initial release |

---

## Roadmap

### Phase 1-2 (Completed)
- Security hardening
- Backend server integration
- JWT authentication
- Rate limiting
- XSS protection

### Phase 3 (Completed)
- Code splitting
- Performance optimization
- Error boundaries

### Phase 4 (In Progress)
- Type safety enhancements
- Code quality refactoring
- Component extraction

### Phase 5 (Planned)
- Persistent database (PostgreSQL/MongoDB)
- Feature-based folder structure
- State management (Zustand/Jotai)
- Virtual scrolling for messages

---

**Built by FIDI.ai Team**
