# FIDI.AI - Comprehensive Implementation Plan
## Created: November 27, 2025

This document outlines a complete implementation roadmap for taking FIDI.ai from 85% to 100% production-ready.

---

## 📊 Overview

**Total Phases**: 8
**Estimated Total Time**: 80-100 hours (2-3 weeks with 1 developer)
**Current Status**: 85% production-ready
**Target Status**: 100% production-ready with polish

---

## 🎯 Phase 1: ChatInterface Refactoring (IMMEDIATE)

**Priority**: 🔴 CRITICAL
**Estimated Time**: 6-8 hours
**Dependencies**: None (all utilities already created)
**Goal**: Reduce ChatInterface from 723 lines to ~450 lines

### Tasks

#### 1.1 Integrate useConversations Hook
**File**: `components/ChatInterface.tsx`
**Time**: 2 hours

**Current Code (Lines 90-155)**:
```typescript
const [conversations, setConversations] = useState<Conversation[]>([]);
const [currentId, setCurrentId] = useState<string | null>(null);
// ... manual localStorage management
```

**Replace With**:
```typescript
import { useConversations } from '../hooks/useConversations';

const {
  conversations,
  currentId,
  setConversations,
  setCurrentId,
  addConversation,
  updateConversation,
  deleteConversation,
  loadConversations
} = useConversations(currentUser);
```

**Impact**:
- Remove ~65 lines of conversation state management
- Automatic persistence to localStorage
- Cleaner conversation CRUD operations

---

#### 1.2 Integrate useFileAttachments Hook
**File**: `components/ChatInterface.tsx`
**Time**: 1.5 hours

**Current Code (Lines 143-178)**:
```typescript
const [attachments, setAttachments] = useState<Attachment[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);
// ... manual file handling
```

**Replace With**:
```typescript
import { useFileAttachments } from '../hooks/useFileAttachments';

const {
  attachments,
  isUploading,
  fileInputRef,
  handleFileSelect,
  removeAttachment,
  clearAttachments
} = useFileAttachments();
```

**Impact**:
- Remove ~35 lines of file handling code
- Add loading state for file uploads
- Automatic file size validation
- Better error messages

---

#### 1.3 Integrate useAutoScroll Hook
**File**: `components/ChatInterface.tsx`
**Time**: 1 hour

**Current Code (Lines 398-404)**:
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [conversations, currentId, processingStatus]);
```

**Replace With**:
```typescript
import { useAutoScroll } from '../hooks/useAutoScroll';

const { scrollContainerRef, messagesEndRef, isNearBottom, scrollToBottom } = useAutoScroll({
  dependencies: [conversations, currentId, processingStatus],
  enabled: true
});
```

**Impact**:
- Remove ~10 lines
- Smart scroll (only when user is at bottom)
- Better UX when reviewing old messages

---

#### 1.4 Integrate Constants
**File**: `components/ChatInterface.tsx`
**Time**: 1 hour

**Replace All Magic Numbers**:
```typescript
import { TIMEOUTS, FILE_LIMITS, UI, MESSAGE } from '../config/constants';

// Before: setTimeout(() => controller.abort(), 60000);
// After:  setTimeout(() => controller.abort(), TIMEOUTS.ABORT_TIMEOUT);

// Before: if (input.length > 30)
// After:  if (input.length > UI.TITLE_MAX_LENGTH)
```

**Impact**:
- Remove ~8-10 magic numbers
- Centralized configuration
- Easier to adjust timeouts/limits

---

#### 1.5 Integrate Messages
**File**: `components/ChatInterface.tsx`
**Time**: 1.5 hours

**Replace All Hardcoded Strings**:
```typescript
import { MESSAGES, getFileSizeError } from '../config/messages';

// Before: "Processando..."
// After:  MESSAGES.INFO.PROCESSING

// Before: "Arquivo muito grande"
// After:  getFileSizeError(FILE_LIMITS.MAX_SIZE_MB)
```

**Impact**:
- Remove ~15-20 hardcoded strings
- Consistent Portuguese messages
- Easy to add i18n later

---

#### 1.6 Integrate Agent Utils
**File**: `components/ChatInterface.tsx`
**Time**: 30 minutes

**Replace Agent Validation**:
```typescript
import { getValidAgentId, detectMediaRequest } from '../lib/agentUtils';

// Before: Complex agent validation logic
// After:  const validAgentId = getValidAgentId(agentId);

// Before: Manual keyword detection
// After:  const { isImage, isVideo } = detectMediaRequest(input);
```

**Impact**:
- Remove ~20 lines of validation code
- Centralized keyword detection

---

### Phase 1 Verification

**Checklist**:
- [ ] ChatInterface reduced from 723 to ~450 lines
- [ ] All hooks imported and used correctly
- [ ] All constants imported and magic numbers removed
- [ ] All messages imported and hardcoded strings removed
- [ ] Build passes: `npm run build`
- [ ] Manual testing: Create conversation, send message, attach file
- [ ] No console errors in browser

**Expected Result**: ChatInterface is ~40% smaller, more maintainable, and uses all new utilities.

---

## 🧪 Phase 2: Testing Infrastructure (IMMEDIATE)

**Priority**: 🔴 CRITICAL
**Estimated Time**: 8-10 hours
**Dependencies**: Phase 1 (optional, can run parallel)
**Goal**: Achieve 60%+ test coverage on utilities and hooks

### Tasks

#### 2.1 Set Up Vitest
**Time**: 1 hour

**Install Dependencies**:
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/react-hooks @testing-library/jest-dom happy-dom
```

**Create `vitest.config.ts`**:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '*.config.*']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
});
```

**Create `test/setup.ts`**:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});
```

**Update `package.json`**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

#### 2.2 Unit Tests for Hooks
**Time**: 3 hours

**File**: `hooks/__tests__/useConversations.test.ts`
```typescript
import { renderHook, act } from '@testing-library/react';
import { useConversations } from '../useConversations';
import { User } from '../../types';

describe('useConversations', () => {
  const mockUser: User = { id: 'test-user', email: 'test@example.com', name: 'Test' };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty conversations', () => {
    const { result } = renderHook(() => useConversations(mockUser));
    expect(result.current.conversations).toEqual([]);
  });

  it('should add a new conversation', () => {
    const { result } = renderHook(() => useConversations(mockUser));
    const newConversation = {
      id: 'conv-1',
      agentId: '01',
      title: 'Test',
      messages: [],
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(newConversation);
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.currentId).toBe('conv-1');
  });

  // ... more tests
});
```

**File**: `hooks/__tests__/useFileAttachments.test.ts`
**File**: `hooks/__tests__/useAutoScroll.test.ts`

**Test Coverage**:
- State initialization
- Add/remove operations
- Edge cases (null user, quota exceeded)
- Error handling

---

#### 2.3 Unit Tests for Utilities
**Time**: 4 hours

**File**: `lib/__tests__/agentUtils.test.ts`
```typescript
import { getValidAgentId, isValidAgentId, detectMediaRequest } from '../agentUtils';

describe('agentUtils', () => {
  describe('getValidAgentId', () => {
    it('should return valid agent ID', () => {
      expect(getValidAgentId('01')).toBe('01');
      expect(getValidAgentId('02')).toBe('02');
    });

    it('should fallback to 01 for invalid ID', () => {
      expect(getValidAgentId('99')).toBe('01');
      expect(getValidAgentId(undefined)).toBe('01');
    });
  });

  describe('detectMediaRequest', () => {
    it('should detect image keywords', () => {
      const result = detectMediaRequest('crie uma imagem de um gato');
      expect(result.isImage).toBe(true);
      expect(result.isVideo).toBe(false);
    });

    it('should detect video keywords', () => {
      const result = detectMediaRequest('gere um vídeo animado');
      expect(result.isImage).toBe(false);
      expect(result.isVideo).toBe(true);
    });
  });
});
```

**File**: `lib/__tests__/titleGenerator.test.ts`
**File**: `lib/__tests__/conversationExport.test.ts`
**File**: `lib/__tests__/storageUtils.test.ts`

**Test Coverage**:
- Happy paths
- Error cases
- Edge cases (empty input, long strings)
- Type safety

---

#### 2.4 Integration Tests
**Time**: 2 hours

**File**: `server/src/__tests__/chat.test.ts`
```typescript
import request from 'supertest';
import { app } from '../index';

describe('POST /api/chat/stream', () => {
  it('should reject missing model', async () => {
    const response = await request(app)
      .post('/api/chat/stream')
      .send({ systemPrompt: 'test', messages: [] });

    expect(response.status).toBe(400);
  });

  it('should reject missing systemPrompt', async () => {
    const response = await request(app)
      .post('/api/chat/stream')
      .send({ model: 'google/gemini-flash-1.5', messages: [] });

    expect(response.status).toBe(400);
  });

  // ... more tests
});
```

---

### Phase 2 Verification

**Checklist**:
- [ ] Vitest configured and running
- [ ] All hooks have unit tests (>80% coverage)
- [ ] All utilities have unit tests (>80% coverage)
- [ ] Integration tests for critical API routes
- [ ] `npm run test` passes all tests
- [ ] `npm run test:coverage` shows >60% overall coverage

---

## 📦 Phase 3: Bundle Optimization (IMMEDIATE)

**Priority**: 🟡 HIGH
**Estimated Time**: 4-6 hours
**Dependencies**: Phase 1 (ChatInterface refactoring)
**Goal**: Reduce ChatInterface bundle from 797KB to <500KB

### Tasks

#### 3.1 Implement Code-Splitting
**Time**: 2 hours

**File**: `App.tsx`

**Current**:
```typescript
const ChatInterface = lazy(() => import('./components/ChatInterface'));
```

**Enhanced**:
```typescript
const ChatInterface = lazy(() => import(
  /* webpackChunkName: "chat-interface" */
  /* webpackPrefetch: true */
  './components/ChatInterface'
));

const AgentsPage = lazy(() => import(
  /* webpackChunkName: "agents-page" */
  './components/AgentsPage'
));
```

---

#### 3.2 Split ReactMarkdown and Dependencies
**Time**: 2 hours

**Create**: `components/MarkdownRenderer.tsx`
```typescript
import { lazy, Suspense } from 'react';

const ReactMarkdown = lazy(() => import('react-markdown'));
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(mod => ({ default: mod.Prism })));

export const MarkdownRenderer = ({ content }: { content: string }) => (
  <Suspense fallback={<div>{content}</div>}>
    <ReactMarkdown
      components={{
        code: ({ language, value }) => (
          <Suspense fallback={<pre>{value}</pre>}>
            <SyntaxHighlighter language={language}>
              {value}
            </SyntaxHighlighter>
          </Suspense>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  </Suspense>
);
```

**Impact**: ReactMarkdown (~200KB) loaded only when needed

---

#### 3.3 Manual Chunk Configuration
**Time**: 1 hour

**File**: `vite.config.ts`

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-markdown': ['react-markdown', 'react-syntax-highlighter'],
          'utils': [
            './lib/agentUtils',
            './lib/storageUtils',
            './lib/titleGenerator',
            './lib/conversationExport'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
```

---

#### 3.4 Optimize Dependencies
**Time**: 1 hour

**Audit Large Dependencies**:
```bash
npx vite-bundle-visualizer
```

**Replace Heavy Dependencies**:
- Consider `date-fns` instead of full moment.js (if used)
- Use `@react-icons` instead of entire lucide-react (tree-shaking)
- Lazy load DOMPurify only when needed

---

### Phase 3 Verification

**Checklist**:
- [ ] ChatInterface chunk <500KB (current: 797KB)
- [ ] Main bundle <400KB (current: 351KB)
- [ ] Total initial load <800KB (compressed)
- [ ] No performance regression in Lighthouse
- [ ] All code-split chunks load correctly

**Expected Result**:
- ChatInterface: 797KB → ~450KB (43% reduction)
- Initial load time: Improved by 30-40%

---

## 🎨 Phase 4: Export/Import UI (SHORT-TERM)

**Priority**: 🟡 HIGH
**Estimated Time**: 4-5 hours
**Dependencies**: Phase 1
**Goal**: Make export/import functionality usable

### Tasks

#### 4.1 Create Export/Import UI Component
**Time**: 2 hours

**Create**: `components/ConversationManager.tsx`
```typescript
import { useState } from 'react';
import { Download, Upload, FileJson, FileText } from 'lucide-react';
import {
  exportConversations,
  exportSingleConversation,
  exportConversationsAsMarkdown,
  importConversations
} from '../lib/conversationExport';
import { MESSAGES } from '../config/messages';

interface ConversationManagerProps {
  conversations: Conversation[];
  currentUser: User;
  onImport: (conversations: Conversation[]) => void;
}

export const ConversationManager: React.FC<ConversationManagerProps> = ({
  conversations,
  currentUser,
  onImport
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExportAll = () => {
    exportConversations(conversations, currentUser.id);
  };

  const handleExportMarkdown = () => {
    exportConversationsAsMarkdown(conversations, currentUser.id);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const imported = await importConversations(file);
      onImport(imported);
      alert(`${MESSAGES.SUCCESS.IMPORT_SUCCESS} ${imported.length} conversas importadas.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : MESSAGES.ERRORS.IMPORT_ERROR);
    } finally {
      setIsImporting(false);
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="conversation-manager">
      {/* Export Section */}
      <div className="export-section">
        <h3>Exportar Conversas</h3>
        <button onClick={handleExportAll} className="btn-export">
          <FileJson size={16} />
          Exportar JSON
        </button>
        <button onClick={handleExportMarkdown} className="btn-export">
          <FileText size={16} />
          Exportar Markdown
        </button>
      </div>

      {/* Import Section */}
      <div className="import-section">
        <h3>Importar Conversas</h3>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => importInputRef.current?.click()}
          disabled={isImporting}
          className="btn-import"
        >
          <Upload size={16} />
          {isImporting ? MESSAGES.INFO.LOADING : 'Importar JSON'}
        </button>
      </div>
    </div>
  );
};
```

---

#### 4.2 Integrate into ChatInterface
**Time**: 1 hour

**File**: `components/ChatInterface.tsx`

```typescript
import { ConversationManager } from './ConversationManager';

// Add state for showing manager
const [showManager, setShowManager] = useState(false);

// Add import handler
const handleImport = (importedConversations: Conversation[]) => {
  setConversations(prev => [...importedConversations, ...prev]);
  setShowManager(false);
};

// Add button in sidebar
<button onClick={() => setShowManager(true)}>
  <Download size={16} />
  Gerenciar Conversas
</button>

// Add modal
{showManager && (
  <div className="modal-overlay">
    <div className="modal-content">
      <ConversationManager
        conversations={conversations}
        currentUser={currentUser}
        onImport={handleImport}
      />
      <button onClick={() => setShowManager(false)}>Fechar</button>
    </div>
  </div>
)}
```

---

#### 4.3 Add Single Conversation Export
**Time**: 1 hour

**In Conversation List**:
```typescript
<div className="conversation-item">
  <span>{conv.title}</span>
  <button
    onClick={(e) => {
      e.stopPropagation();
      exportSingleConversation(conv);
    }}
    title="Exportar esta conversa"
  >
    <Download size={14} />
  </button>
</div>
```

---

### Phase 4 Verification

**Checklist**:
- [ ] Export all conversations to JSON works
- [ ] Export all conversations to Markdown works
- [ ] Import conversations from JSON works
- [ ] Single conversation export works
- [ ] Import validation catches malformed files
- [ ] UI is accessible and responsive

---

## 🚦 Phase 5: Rate Limiting & Logging (SHORT-TERM)

**Priority**: 🟡 HIGH
**Estimated Time**: 5-6 hours
**Dependencies**: None
**Goal**: Prevent API abuse and enable debugging

### Tasks

#### 5.1 Implement Rate Limiting
**Time**: 2 hours

**Install Dependencies**:
```bash
cd server
npm install express-rate-limit
```

**File**: `server/src/middleware/rateLimiter.ts`
```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for expensive operations (AI generation)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 AI requests per minute
  message: {
    error: 'Limite de geração excedido. Aguarde 1 minuto.',
    code: 'AI_RATE_LIMIT'
  }
});

// Auth limiter (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT'
  }
});
```

**File**: `server/src/index.ts`
```typescript
import { apiLimiter, aiLimiter, authLimiter } from './middleware/rateLimiter';

// Apply limiters
app.use('/api/', apiLimiter);
app.use('/api/chat/', aiLimiter);
app.use('/api/media/', aiLimiter);
app.use('/api/auth/', authLimiter);
```

---

#### 5.2 Create Logging Service
**Time**: 3 hours

**Install Dependencies**:
```bash
npm install winston
```

**File**: `lib/logger.ts` (Client)**:
```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context
    };

    // Console logging in development
    if (this.isDevelopment) {
      const style = this.getStyle(level);
      console.log(`%c[${level.toUpperCase()}]`, style, message, context || '');
    }

    // Send critical errors to backend
    if (level === 'error' && !this.isDevelopment) {
      this.sendToBackend(entry);
    }
  }

  private getStyle(level: LogLevel): string {
    const styles = {
      info: 'color: #3B82F6',
      warn: 'color: #F59E0B',
      error: 'color: #EF4444; font-weight: bold',
      debug: 'color: #6B7280'
    };
    return styles[level];
  }

  private async sendToBackend(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch {
      // Silently fail to avoid infinite loops
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();
```

**File**: `server/src/lib/logger.ts` (Server)**:
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}
```

**Replace all console.error**:
```typescript
// Before: console.error('Failed to save media:', error);
// After:  logger.error('Failed to save media', { error, messageId });
```

---

### Phase 5 Verification

**Checklist**:
- [ ] Rate limiting prevents >100 requests in 15 minutes
- [ ] AI endpoints limited to 20 requests/minute
- [ ] Auth limited to 5 attempts/15 minutes
- [ ] Logger works in development (console)
- [ ] Logger works in production (files)
- [ ] All console.error replaced with logger.error

---

## ♿ Phase 6: Accessibility (LONG-TERM)

**Priority**: 🟢 MEDIUM
**Estimated Time**: 8-10 hours
**Dependencies**: Phase 1 (ChatInterface refactoring)
**Goal**: WCAG AA compliance

### Tasks

#### 6.1 Add ARIA Labels
**Time**: 3 hours

**ChatInterface Updates**:
```typescript
<input
  type="text"
  value={input}
  onChange={handleInputChange}
  aria-label="Digite sua mensagem para o agente"
  aria-describedby="input-help"
/>

<button
  onClick={handleSend}
  disabled={!input.trim() || isTyping}
  aria-label="Enviar mensagem"
  aria-disabled={!input.trim() || isTyping}
>
  <Send size={20} />
</button>

<button
  onClick={handleNewConversation}
  aria-label="Criar nova conversa"
>
  <Plus size={16} />
</button>
```

**Add Hidden Descriptions**:
```typescript
<span id="input-help" className="sr-only">
  Digite sua mensagem e pressione Enter ou clique em Enviar
</span>
```

---

#### 6.2 Keyboard Navigation
**Time**: 4 hours

**Global Keyboard Shortcuts**:
```typescript
// hooks/useKeyboardShortcuts.ts
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ - Show shortcuts help
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        showShortcutsModal();
      }

      // Ctrl+N - New conversation
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNewConversation();
      }

      // Ctrl+K - Focus search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        focusSearch();
      }

      // Escape - Close modals
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

**Focus Management**:
```typescript
// Auto-focus input when conversation changes
useEffect(() => {
  if (currentId && inputRef.current) {
    inputRef.current.focus();
  }
}, [currentId]);

// Focus trap in modals
<FocusTrap active={isModalOpen}>
  <div className="modal">...</div>
</FocusTrap>
```

---

#### 6.3 Screen Reader Support
**Time**: 2 hours

**Live Regions for Dynamic Content**:
```typescript
<div
  role="log"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isTyping && `${currentAgent.name} está digitando...`}
  {processingStatus && processingStatus}
</div>

<div
  role="status"
  aria-live="assertive"
  aria-atomic="true"
  className="sr-only"
>
  {error && `Erro: ${error}`}
</div>
```

**Semantic HTML**:
```typescript
<nav aria-label="Conversas">
  <ul role="list">
    {conversations.map(conv => (
      <li key={conv.id}>
        <button
          onClick={() => setCurrentId(conv.id)}
          aria-current={conv.id === currentId ? 'page' : undefined}
        >
          {conv.title}
        </button>
      </li>
    ))}
  </ul>
</nav>

<main role="main" aria-label="Chat">
  {/* Messages */}
</main>
```

---

#### 6.4 Color Contrast & Focus Indicators
**Time**: 1 hour

**Update CSS**:
```css
/* High contrast focus indicators */
*:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Ensure WCAG AA contrast ratios */
.text-gray-400 {
  color: #9CA3AF; /* Check contrast against background */
}

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-to-main:focus {
  top: 0;
}
```

---

### Phase 6 Verification

**Checklist**:
- [ ] All interactive elements have ARIA labels
- [ ] Keyboard shortcuts work (Ctrl+N, Ctrl+K, Escape)
- [ ] Screen reader announces status changes
- [ ] Focus indicators visible on all elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Skip to content link works
- [ ] Test with NVDA/JAWS screen reader
- [ ] axe DevTools shows 0 violations

---

## 📊 Phase 7: Performance Monitoring (LONG-TERM)

**Priority**: 🟢 MEDIUM
**Estimated Time**: 6-8 hours
**Dependencies**: Phase 5 (Logging)
**Goal**: Visibility into performance and errors

### Tasks

#### 7.1 Set Up Sentry (Error Tracking)
**Time**: 2 hours

**Install**:
```bash
npm install @sentry/react @sentry/vite-plugin
```

**File**: `lib/sentry.ts`
```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE
  });
}
```

**Wrap App**:
```typescript
import * as Sentry from '@sentry/react';

const SentryApp = Sentry.withProfiler(App);
```

---

#### 7.2 Add Web Vitals Tracking
**Time**: 2 hours

**Install**:
```bash
npm install web-vitals
```

**File**: `lib/analytics.ts`
```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // Send to your analytics service
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta
    });
  }

  // Log for debugging
  logger.debug('Web Vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating
  });
};

export const initWebVitals = () => {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};
```

---

#### 7.3 Custom Performance Metrics
**Time**: 2 hours

**Track API Response Times**:
```typescript
// lib/apiClient.ts
const trackAPICall = async (endpoint: string, operation: () => Promise<any>) => {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;

    logger.info('API Call Success', {
      endpoint,
      duration,
      status: 'success'
    });

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    logger.error('API Call Failed', {
      endpoint,
      duration,
      status: 'error',
      error
    });

    throw error;
  }
};
```

**Track User Actions**:
```typescript
export const trackEvent = (category: string, action: string, label?: string) => {
  logger.info('User Event', { category, action, label });

  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
};

// Usage
trackEvent('chat', 'message_sent', currentAgent.name);
trackEvent('conversation', 'created');
trackEvent('media', 'image_generated');
```

---

### Phase 7 Verification

**Checklist**:
- [ ] Sentry catching and reporting errors
- [ ] Web Vitals tracked (CLS, FID, LCP, etc.)
- [ ] API response times logged
- [ ] User events tracked
- [ ] Dashboard showing metrics
- [ ] Alerts configured for critical errors

---

## 🔐 Phase 8: JWT Authentication (LONG-TERM)

**Priority**: 🟢 LOW (Current auth works for MVP)
**Estimated Time**: 12-15 hours
**Dependencies**: None (can run parallel)
**Goal**: Replace localStorage auth with secure JWT system

### Tasks

#### 8.1 Backend JWT Setup
**Time**: 4 hours

**Already Installed**: `jsonwebtoken`, `bcryptjs`

**File**: `server/src/lib/jwt.ts`
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
};
```

**File**: `server/src/middleware/auth.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { APIError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new APIError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(new APIError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
};
```

---

#### 8.2 Update Auth Routes
**Time**: 3 hours

**File**: `server/src/routes/auth.ts` (Update existing)**:
```typescript
import bcrypt from 'bcryptjs';
import { generateToken, generateRefreshToken } from '../lib/jwt';

// Register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate
    if (!email || !password || !name) {
      throw new APIError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    // Check if user exists (use database)
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      throw new APIError('User already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.createUser({
      email,
      name,
      password: hashedPassword
    });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set HTTP-only cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    next(error);
  }
});

// Login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await db.findUserByEmail(email);
    if (!user) {
      throw new APIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new APIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('token', token, { /* ... */ });
    res.cookie('refreshToken', refreshToken, { /* ... */ });

    res.json({
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    next(error);
  }
});

// Logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// Refresh token
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new APIError('Refresh token required', 401, 'NO_REFRESH_TOKEN');
    }

    const decoded = verifyToken(refreshToken);
    const newToken = generateToken(decoded.userId);

    res.cookie('token', newToken, { /* ... */ });
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    next(error);
  }
});
```

---

#### 8.3 Protect API Routes
**Time**: 2 hours

**Apply to Protected Routes**:
```typescript
// server/src/index.ts
import { requireAuth } from './middleware/auth';

app.use('/api/chat', requireAuth, chatRouter);
app.use('/api/media', requireAuth, mediaRouter);
```

---

#### 8.4 Frontend Migration
**Time**: 5 hours

**Update Auth Component**:
```typescript
// components/Auth.tsx
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { user } = await response.json();
    onLoginSuccess(user); // JWT stored in HTTP-only cookie
  } catch (error) {
    setError(error.message);
  }
};
```

**Update API Client**:
```typescript
// lib/apiClient.ts - Always include credentials
const response = await fetch(url, {
  ...options,
  credentials: 'include' // Send cookies with every request
});

// Handle 401 (try to refresh token)
if (response.status === 401) {
  const refreshed = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  if (refreshed.ok) {
    // Retry original request
    return fetch(url, { ...options, credentials: 'include' });
  } else {
    // Redirect to login
    window.location.href = '/auth';
  }
}
```

**Remove localStorage Auth**:
```typescript
// Remove all localStorage user/session code
// Auth state managed by cookies automatically
```

---

#### 8.5 Database Setup (Optional)
**Time**: 3 hours

**Options**:
1. **SQLite** (Simple, file-based)
2. **PostgreSQL** (Production-ready)
3. **MongoDB** (NoSQL)

**Example with Prisma + SQLite**:
```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

**Schema**:
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### Phase 8 Verification

**Checklist**:
- [ ] JWT tokens generated correctly
- [ ] HTTP-only cookies set on login
- [ ] Cookies cleared on logout
- [ ] Protected routes require authentication
- [ ] Token refresh works automatically
- [ ] No JWT stored in localStorage
- [ ] Migration from old auth works
- [ ] Security audit passes

---

## 📅 Timeline Summary

| Phase | Priority | Time | Dependencies | Start After |
|-------|----------|------|--------------|-------------|
| 1. ChatInterface Refactoring | 🔴 Critical | 6-8h | None | Immediate |
| 2. Testing Infrastructure | 🔴 Critical | 8-10h | None | Immediate (parallel) |
| 3. Bundle Optimization | 🟡 High | 4-6h | Phase 1 | Phase 1 done |
| 4. Export/Import UI | 🟡 High | 4-5h | Phase 1 | Phase 1 done |
| 5. Rate Limiting & Logging | 🟡 High | 5-6h | None | Anytime |
| 6. Accessibility | 🟢 Medium | 8-10h | Phase 1 | Phase 1-4 done |
| 7. Performance Monitoring | 🟢 Medium | 6-8h | Phase 5 | Phase 5 done |
| 8. JWT Authentication | 🟢 Low | 12-15h | None | When ready |

**Total Time**: 53-68 hours (7-9 days with 1 developer)

---

## 🚀 Recommended Implementation Order

### Week 1: Foundation (Critical Path)
**Monday-Wednesday**:
- Phase 1: ChatInterface refactoring (6-8h)
- Phase 2: Testing setup (8-10h)
- **Checkpoint**: Build passes, tests run

**Thursday-Friday**:
- Phase 3: Bundle optimization (4-6h)
- Phase 4: Export/Import UI (4-5h)
- Phase 5: Rate limiting & logging (5-6h)
- **Checkpoint**: All immediate priorities done

### Week 2: Quality & Polish
**Monday-Wednesday**:
- Phase 6: Accessibility (8-10h)
- Phase 7: Performance monitoring (6-8h)
- **Checkpoint**: Production-ready with monitoring

**Thursday-Friday (Optional)**:
- Phase 8: JWT authentication (12-15h, can extend to Week 3)
- Buffer time for issues

---

## ✅ Success Criteria

### Must-Have (Blocking Production)
- ✅ ChatInterface uses all new hooks
- ✅ Test coverage >60%
- ✅ Bundle size <500KB per chunk
- ✅ Export/import functionality works
- ✅ Rate limiting active
- ✅ Logging service in place

### Should-Have (Quality)
- ✅ WCAG AA accessibility compliance
- ✅ Error tracking (Sentry)
- ✅ Performance monitoring
- ✅ No accessibility violations (axe)

### Nice-to-Have (Future)
- ✅ JWT authentication
- ✅ Database migration
- ✅ Advanced analytics

---

## 🎯 Final Production Readiness Target

After completing all phases:
- **Security**: 98% (JWT adds final 3%)
- **Performance**: 95% (optimized bundles, monitoring)
- **Accessibility**: 90% (WCAG AA compliant)
- **Maintainability**: 95% (tested, modular, well-organized)
- **User Experience**: 95% (fast, accessible, reliable)

**Overall Production Readiness**: 95%+ ✅

---

**Plan Created**: November 27, 2025
**Estimated Completion**: December 11, 2025 (2 weeks)
**Status**: 📋 READY TO IMPLEMENT
