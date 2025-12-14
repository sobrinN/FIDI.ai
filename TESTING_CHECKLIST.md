# Frontend Token Balance - Testing Checklist

**Implementation Date:** 2025-12-12
**Version:** 0.3.0
**Status:** Ready for Testing

## Quick Start Testing

### Prerequisites
1. Backend server running on port 3001 with token system enabled
2. Frontend dev server running on port 3000
3. User account with known token balance

### Basic Test Flow
```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Monitor backend logs
cd server && tail -f logs/app.log
```

---

## Test Cases

### 1. Visual Display Tests

#### Test 1.1: Component Renders
- [ ] **Action:** Log in to chat interface
- [ ] **Expected:** Token balance component appears in sidebar
- [ ] **Location:** Top of sidebar, before agent selector
- [ ] **Verify:** Component has balance number, progress bar, stats

#### Test 1.2: Color Coding - Healthy (Green)
- [ ] **Setup:** User balance >= 25,000 tokens (50%+)
- [ ] **Expected:** Green text and progress bar
- [ ] **Verify:** `text-green-400` and `bg-green-500` applied
- [ ] **No Warning:** Low balance warning should NOT appear

#### Test 1.3: Color Coding - Warning (Yellow)
- [ ] **Setup:** User balance 10,000-24,999 tokens (20-50%)
- [ ] **Expected:** Yellow text and progress bar
- [ ] **Verify:** `text-yellow-400` and `bg-yellow-500` applied
- [ ] **No Warning:** Low balance warning should NOT appear

#### Test 1.4: Color Coding - Critical (Red)
- [ ] **Setup:** User balance < 10,000 tokens (<20%)
- [ ] **Expected:** Red text and progress bar
- [ ] **Verify:** `text-red-400` and `bg-red-500` applied
- [ ] **Warning Appears:** Low balance warning box should appear

#### Test 1.5: Progress Bar Accuracy
- [ ] **Setup:** Balance = 25,000 tokens
- [ ] **Expected:** Progress bar at 50% width
- [ ] **Setup:** Balance = 12,500 tokens
- [ ] **Expected:** Progress bar at 25% width
- [ ] **Setup:** Balance = 50,000 tokens
- [ ] **Expected:** Progress bar at 100% width (full)

#### Test 1.6: Number Formatting
- [ ] **Test:** 50000 → displays as "50,000"
- [ ] **Test:** 1234 → displays as "1,234"
- [ ] **Test:** 0 → displays as "0"
- [ ] **Test:** 123 → displays as "123" (no comma)

#### Test 1.7: Stats Display
- [ ] **Verify:** "Used" shows `tokenUsageThisMonth`
- [ ] **Verify:** "Reset" shows `daysUntilReset`
- [ ] **Test:** 1 day → displays "1 day" (singular)
- [ ] **Test:** 5 days → displays "5 days" (plural)

---

### 2. Functionality Tests

#### Test 2.1: Pre-Send Warning (< 1000 tokens)
- [ ] **Setup:** Set user balance to 850 tokens
- [ ] **Action:** Type message and click Send
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Content:** Shows balance, reset days, "Do you want to continue?"
- [ ] **Cancel:** Message not sent, input preserved
- [ ] **OK:** Message sent (may fail with 402 if truly insufficient)

#### Test 2.2: Pre-Send Warning (>= 1000 tokens)
- [ ] **Setup:** Set user balance to 1000+ tokens
- [ ] **Action:** Type message and click Send
- [ ] **Expected:** NO confirmation dialog
- [ ] **Result:** Message sent immediately

---

### 3. Error Handling Tests

#### Test 3.1: Insufficient Tokens - Chat
- [ ] **Setup:** Backend returns 402 for chat
- [ ] **Action:** Send a message
- [ ] **Expected:** Error message in chat as assistant message
- [ ] **Content Includes:**
  - [ ] "Insufficient Tokens" header
  - [ ] Current balance number
  - [ ] Days until reset
  - [ ] "Each message typically uses 100-500 tokens"
- [ ] **Verify:** Markdown formatting renders (bold header)

#### Test 3.2: Insufficient Tokens - Image Generation
- [ ] **Setup:** Backend returns 402 for image generation
- [ ] **Action:** Ask NENECA to generate an image
- [ ] **Expected:** Error message in chat
- [ ] **Content Includes:**
  - [ ] "Insufficient Tokens" header
  - [ ] Current balance number
  - [ ] Days until reset
  - [ ] "Image generation typically uses 2,000-5,000 tokens"

#### Test 3.3: Insufficient Tokens - Video Generation
- [ ] **Setup:** Backend returns 402 for video generation
- [ ] **Action:** Ask NENECA to generate a video
- [ ] **Expected:** Error message in chat
- [ ] **Content Includes:**
  - [ ] "Insufficient Tokens" header
  - [ ] Current balance number
  - [ ] Days until reset
  - [ ] "Video generation typically uses 5,000-10,000 tokens"

---

### 4. Backend Integration Tests

#### Test 4.1: User Login Token Data
- [ ] **Action:** Log in via `/api/auth/login`
- [ ] **Verify Network Tab:** Response includes:
  ```json
  {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "tokenBalance": 50000,
      "tokenUsageThisMonth": 0,
      "daysUntilReset": 30
    }
  }
  ```
- [ ] **Result:** Token balance displays in UI

#### Test 4.2: Token Balance Updates After Chat
- [ ] **Before:** Note current balance (e.g., 50,000)
- [ ] **Action:** Send a chat message
- [ ] **After:** Balance decreases (e.g., to 49,750)
- [ ] **Verify:** UI updates to show new balance
- [ ] **Note:** May require page refresh or `/api/auth/me` call

#### Test 4.3: Token Balance Updates After Image
- [ ] **Before:** Note current balance
- [ ] **Action:** Generate an image
- [ ] **After:** Balance decreases by ~2,000-5,000
- [ ] **Verify:** UI updates to show new balance

#### Test 4.4: Token Balance Updates After Video
- [ ] **Before:** Note current balance
- [ ] **Action:** Generate a video
- [ ] **After:** Balance decreases by ~5,000-10,000
- [ ] **Verify:** UI updates to show new balance

---

### 5. Edge Case Tests

#### Test 5.1: Missing Token Fields
- [ ] **Setup:** Backend returns user without token fields
- [ ] **Expected:** Component displays with defaults (0 tokens)
- [ ] **Verify:** No crashes, red color shown
- [ ] **Verify:** Low balance warning appears

#### Test 5.2: Exactly 0 Tokens
- [ ] **Setup:** User balance = 0
- [ ] **Expected:** Red color, progress bar at 0%
- [ ] **Expected:** All operations return 402
- [ ] **Verify:** Error messages display correctly

#### Test 5.3: Exactly 1 Day Until Reset
- [ ] **Setup:** `daysUntilReset = 1`
- [ ] **Expected:** "1 day" (singular)
- [ ] **Verify:** Confirmation and error messages use "1 day"

#### Test 5.4: 0 Days Until Reset
- [ ] **Setup:** `daysUntilReset = 0`
- [ ] **Expected:** "0 days" displayed
- [ ] **Verify:** Component doesn't crash

#### Test 5.5: Very Large Balance
- [ ] **Setup:** Balance = 999,999 tokens
- [ ] **Expected:** Displays as "999,999"
- [ ] **Verify:** Progress bar at 100% (capped)

#### Test 5.6: Negative Balance (Shouldn't Happen)
- [ ] **Setup:** Manually set balance to -100
- [ ] **Expected:** Progress bar at 0% (clamped)
- [ ] **Verify:** Component doesn't crash

---

### 6. Responsive Design Tests

#### Test 6.1: Desktop (> 1024px)
- [ ] **Verify:** Sidebar always visible
- [ ] **Verify:** Token balance full width in sidebar
- [ ] **Verify:** All stats readable, no wrapping

#### Test 6.2: Tablet (768px - 1024px)
- [ ] **Verify:** Sidebar toggleable with menu button
- [ ] **Verify:** Token balance displays correctly when open
- [ ] **Verify:** Component scales properly

#### Test 6.3: Mobile (< 768px)
- [ ] **Verify:** Sidebar overlay when opened
- [ ] **Verify:** Token balance readable on small screen
- [ ] **Verify:** Touch targets adequate (buttons, close)

---

### 7. Styling & Animation Tests

#### Test 7.1: Glass-morphism Effect
- [ ] **Verify:** Component has semi-transparent black background
- [ ] **Verify:** Subtle border visible (`border-white/10`)
- [ ] **Verify:** Matches other sidebar sections

#### Test 7.2: Progress Bar Animation
- [ ] **Action:** Log in (component mounts)
- [ ] **Expected:** Progress bar animates to current percentage
- [ ] **Duration:** ~500ms smooth transition

#### Test 7.3: Low Balance Warning Animation
- [ ] **Action:** Balance drops below 20% (simulate or use backend)
- [ ] **Expected:** Warning box fades in
- [ ] **Action:** Balance rises above 20%
- [ ] **Expected:** Warning box fades out

#### Test 7.4: Icons Render
- [ ] **Verify:** Zap icon (⚡) for balance
- [ ] **Verify:** TrendingDown icon (↓) for usage
- [ ] **Verify:** Calendar icon (📅) for reset
- [ ] **Verify:** AlertTriangle icon (⚠️) for warning

---

### 8. TypeScript & Code Quality Tests

#### Test 8.1: TypeScript Compilation
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Expected: No errors related to TokenBalance or User type
```
- [ ] **Pass:** No TS errors
- [ ] **Fail:** Review and fix type issues

#### Test 8.2: Linting
```bash
# Run ESLint
npm run lint

# Expected: No errors in TokenBalance.tsx or ChatInterface.tsx
```
- [ ] **Pass:** No lint errors
- [ ] **Fail:** Fix linting issues

#### Test 8.3: Console Errors
- [ ] **Action:** Open browser console
- [ ] **Expected:** No errors or warnings related to TokenBalance
- [ ] **Check:** React warnings, prop type warnings

---

### 9. Accessibility Tests

#### Test 9.1: Keyboard Navigation
- [ ] **Action:** Tab through sidebar
- [ ] **Verify:** Token balance is part of tab order
- [ ] **Verify:** Focus indicators visible

#### Test 9.2: Screen Reader
- [ ] **Tool:** Use NVDA, JAWS, or VoiceOver
- [ ] **Verify:** Balance number announced
- [ ] **Verify:** Stats labels announced
- [ ] **Verify:** Warning message announced

#### Test 9.3: Contrast Ratios
- [ ] **Tool:** Use WebAIM Contrast Checker or browser DevTools
- [ ] **Verify:** Green text on black: >= 4.5:1 (AA)
- [ ] **Verify:** Yellow text on black: >= 4.5:1 (AA)
- [ ] **Verify:** Red text on black: >= 4.5:1 (AA)

---

### 10. Performance Tests

#### Test 10.1: Render Performance
- [ ] **Action:** Open chat interface
- [ ] **Measure:** Time to first render of TokenBalance
- [ ] **Expected:** < 100ms
- [ ] **Tool:** React DevTools Profiler

#### Test 10.2: Re-render Behavior
- [ ] **Action:** Send multiple messages
- [ ] **Observe:** Component re-renders
- [ ] **Verify:** No unnecessary re-renders
- [ ] **Consideration:** Add React.memo if needed

#### Test 10.3: Memory Leaks
- [ ] **Action:** Open/close sidebar 10 times
- [ ] **Monitor:** Browser memory usage
- [ ] **Expected:** No significant memory growth
- [ ] **Tool:** Chrome DevTools Memory Profiler

---

## Automated Testing (Future)

### Unit Tests (Vitest)

```typescript
// Example test structure
describe('TokenBalance Component', () => {
  it('renders with user data', () => {
    const user = { id: '1', name: 'Test', email: 'test@test.com', tokenBalance: 25000 };
    render(<TokenBalance user={user} />);
    expect(screen.getByText('25,000')).toBeInTheDocument();
  });

  it('shows green color when balance > 50%', () => {
    const user = { ...baseUser, tokenBalance: 30000 };
    render(<TokenBalance user={user} />);
    const balance = screen.getByText('30,000');
    expect(balance).toHaveClass('text-green-400');
  });

  it('shows low balance warning when < 20%', () => {
    const user = { ...baseUser, tokenBalance: 5000 };
    render(<TokenBalance user={user} />);
    expect(screen.getByText(/Low Balance/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
describe('Token Balance Integration', () => {
  it('updates after sending message', async () => {
    // Mock backend 402 response
    server.use(
      rest.post('/api/chat/stream', (req, res, ctx) => {
        return res(ctx.status(402), ctx.json({ error: 'Insufficient tokens' }));
      })
    );

    const { user } = renderChatInterface({ tokenBalance: 50 });

    // Send message
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    await userEvent.click(screen.getByText('Send'));

    // Verify error message
    expect(await screen.findByText(/Insufficient Tokens/i)).toBeInTheDocument();
  });
});
```

---

## Common Issues & Solutions

### Issue 1: Balance Shows 0
**Symptom:** Component displays but shows 0 tokens
**Causes:**
- Backend not returning token fields
- User object missing data
- localStorage out of sync

**Debug Steps:**
1. Open Network tab, filter for `/api/auth/me`
2. Check response JSON for `tokenBalance`, `tokenUsageThisMonth`, `daysUntilReset`
3. If missing, verify backend token middleware is active
4. Check server logs for errors

**Solution:**
```bash
# Backend: Verify token middleware
cd server/src/middleware
cat tokenQuota.ts  # Should have attachTokenInfo middleware

# Frontend: Check user object
console.log(currentUser);  // Should have token fields
```

### Issue 2: 402 Errors Not Caught
**Symptom:** Generic error instead of token message
**Causes:**
- Backend not sending HTTP 402
- API client not handling 402
- Missing APIError import

**Debug Steps:**
1. Network tab → Check response status code
2. Console → Check error object type
3. Verify `error instanceof APIError` check

**Solution:**
```typescript
// Verify in ChatInterface.tsx
import { APIError } from '../lib/apiClient';

// Check error handling
if (error instanceof APIError && error.code === 'INSUFFICIENT_TOKENS') {
  // Handle token error
}
```

### Issue 3: Component Not Rendering
**Symptom:** Token balance doesn't appear in sidebar
**Causes:**
- `currentUser` is null
- Component not imported
- Conditional render failing

**Debug Steps:**
1. Check if user is logged in
2. Verify import: `import { TokenBalance } from './TokenBalance';`
3. Check conditional: `{currentUser && <TokenBalance user={currentUser} />}`

**Solution:**
```typescript
// Add debug log
console.log('Current User:', currentUser);

// Verify placement in ChatInterface.tsx around line 544
{currentUser && (
  <div className="p-4 border-b border-blue-900/30">
    <TokenBalance user={currentUser} />
  </div>
)}
```

### Issue 4: Styling Broken
**Symptom:** Component looks misaligned or unstyled
**Causes:**
- Tailwind not loaded
- Missing Lucide icons
- Parent container issues

**Solution:**
```bash
# Check Tailwind CDN in index.html
grep tailwindcss index.html

# Verify Lucide React installed
npm list lucide-react

# Check for CSS conflicts
# Use browser DevTools → Elements → Computed styles
```

---

## Test Data Setup

### Backend Test Users

Create test users with different balance levels:

```javascript
// In backend or database seeding script
const testUsers = [
  {
    email: 'healthy@test.com',
    tokenBalance: 45000,  // 90% - Green
    tokenUsageThisMonth: 5000,
    daysUntilReset: 15
  },
  {
    email: 'warning@test.com',
    tokenBalance: 15000,  // 30% - Yellow
    tokenUsageThisMonth: 35000,
    daysUntilReset: 10
  },
  {
    email: 'critical@test.com',
    tokenBalance: 5000,   // 10% - Red with warning
    tokenUsageThisMonth: 45000,
    daysUntilReset: 5
  },
  {
    email: 'verylow@test.com',
    tokenBalance: 500,    // 1% - Pre-send warning
    tokenUsageThisMonth: 49500,
    daysUntilReset: 2
  },
  {
    email: 'empty@test.com',
    tokenBalance: 0,      // 0% - All blocked
    tokenUsageThisMonth: 50000,
    daysUntilReset: 1
  }
];
```

### Manual Balance Adjustment

For testing, you can manually adjust balances:

```javascript
// In backend userStorage.ts or database
updateUser(userId, {
  tokenBalance: 5000,        // Set to desired level
  tokenUsageThisMonth: 45000,
  daysUntilReset: 3
});
```

---

## Sign-Off Checklist

Before marking implementation complete:

- [ ] All 10 test sections completed
- [ ] No critical bugs found
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without errors
- [ ] Component renders correctly on all screen sizes
- [ ] Error handling works for all API endpoints
- [ ] Documentation reviewed and accurate
- [ ] Code committed to git with descriptive message
- [ ] Screenshots captured for documentation
- [ ] Backend team notified of frontend completion

---

## Next Steps

1. **QA Testing:** Hand off to QA team with this checklist
2. **User Testing:** Beta test with real users
3. **Performance Monitoring:** Track render times in production
4. **Analytics:** Monitor how often users hit token limits
5. **Optimization:** Consider React.memo if performance issues arise
6. **Feature Expansion:** Implement future enhancements (see FRONTEND_TOKEN_IMPLEMENTATION.md)

---

**Checklist Version:** 1.0
**Last Updated:** 2025-12-12
**Prepared By:** FIDI.ai Development Team
