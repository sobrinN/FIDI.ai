# TokenBalance Component - Visual Reference

## Component Appearance

### Full Mode (Default)

```
┌─────────────────────────────────────────────────────┐
│  ⚡ TOKEN BALANCE                          45,250    │ (Green)
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  0                                          50,000   │
│                                                      │
│  ↓ USED              📅 RESET                       │
│  4,750                7 days                         │
└─────────────────────────────────────────────────────┘
```

**State:** Healthy (> 50% balance)
**Color:** Green (`text-green-400`, `bg-green-500`)

---

### Warning State (20-50%)

```
┌─────────────────────────────────────────────────────┐
│  ⚡ TOKEN BALANCE                          15,000    │ (Yellow)
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  0                                          50,000   │
│                                                      │
│  ↓ USED              📅 RESET                       │
│  35,000               12 days                        │
└─────────────────────────────────────────────────────┘
```

**State:** Warning (20-50% balance)
**Color:** Yellow (`text-yellow-400`, `bg-yellow-500`)

---

### Critical State (< 20%)

```
┌─────────────────────────────────────────────────────┐
│  ⚡ TOKEN BALANCE                           5,500    │ (Red)
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  0                                          50,000   │
│                                                      │
│  ↓ USED              📅 RESET                       │
│  44,500               3 days                         │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ ⚠️ Low Balance                               │  │
│  │ Your tokens are running low. Balance resets │  │
│  │ in 3 days.                                   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**State:** Critical (< 20% balance)
**Color:** Red (`text-red-400`, `bg-red-500`)
**Additional:** Low balance warning box appears

---

### Compact Mode

```
┌─────────────────┐
│  ⚡  45,250      │ (Green/Yellow/Red based on balance)
└─────────────────┘
```

**Usage:** For mobile or condensed views
**Props:** `<TokenBalance user={currentUser} compact={true} />`

---

## Integration in ChatInterface

### Sidebar Layout

```
┌────────────────────────────────────────┐
│  FIDI.ai                              ✕ │
│  ┌──────────────────────────────────┐  │
│  │  ⚡ TOKEN BALANCE         45,250  │  │ ← TokenBalance Component
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │  │
│  │  0                         50,000 │  │
│  │  ↓ 4,750    📅 7 days            │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  ACTIVE AGENT                          │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │
│  │ F │ │ T │ │ M │ │ N │              │
│  └───┘ └───┘ └───┘ └───┘              │
│  FIDI                                  │
│  Software Architecture                 │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │  + New Session                    │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  💬 Previous chat...                   │
│  💬 Another conversation...            │
│  💬 Image generation...                │
├────────────────────────────────────────┤
│  👤 John Doe                           │
│     john@example.com                   │
└────────────────────────────────────────┘
```

---

## Error Messages

### Insufficient Tokens - Chat Message

```
┌─────────────────────────────────────────────────────┐
│  🤖 FIDI                                            │
│                                                      │
│  ⚠️ Insufficient Tokens                             │
│                                                      │
│  You don't have enough tokens to send this          │
│  message. Your current balance is 250 tokens.       │
│                                                      │
│  Your token balance will automatically reset in     │
│  5 days.                                            │
│                                                      │
│  Each message typically uses 100-500 tokens         │
│  depending on length and complexity.                │
└─────────────────────────────────────────────────────┘
```

### Insufficient Tokens - Image Generation

```
┌─────────────────────────────────────────────────────┐
│  🎨 NENECA                                          │
│                                                      │
│  ⚠️ Insufficient Tokens                             │
│                                                      │
│  You don't have enough tokens to generate images.   │
│  Your current balance is 1,200 tokens.              │
│                                                      │
│  Your token balance will automatically reset in     │
│  2 days.                                            │
│                                                      │
│  Image generation typically uses 2,000-5,000        │
│  tokens depending on complexity.                    │
└─────────────────────────────────────────────────────┘
```

### Insufficient Tokens - Video Generation

```
┌─────────────────────────────────────────────────────┐
│  🎬 NENECA                                          │
│                                                      │
│  ⚠️ Insufficient Tokens                             │
│                                                      │
│  You don't have enough tokens to generate videos.   │
│  Your current balance is 3,500 tokens.              │
│                                                      │
│  Your token balance will automatically reset in     │
│  1 day.                                             │
│                                                      │
│  Video generation typically uses 5,000-10,000       │
│  tokens depending on length and complexity.         │
└─────────────────────────────────────────────────────┘
```

---

## Pre-Send Confirmation Dialog

### Low Balance Warning (< 1000 tokens)

```
┌─────────────────────────────────────────────────────┐
│  FIDI.ai                                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Low token balance (850 tokens remaining).          │
│                                                      │
│  Your balance will reset in 4 days.                 │
│                                                      │
│  Do you want to continue?                           │
│                                                      │
│            [Cancel]        [OK]                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Trigger:** When sending any operation with < 1,000 tokens
**User Choice:**
- **OK:** Proceed with operation (may fail if truly insufficient)
- **Cancel:** Abort operation, return to chat

---

## Color States Reference

### Progress Bar Fill Examples

**90% Balance (45,000 tokens):**
```
█████████████████████████████████████████████░░░░░
```
Color: Green (`bg-green-500`)

**30% Balance (15,000 tokens):**
```
███████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```
Color: Yellow (`bg-yellow-500`)

**11% Balance (5,500 tokens):**
```
█████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```
Color: Red (`bg-red-500`)

---

## Responsive Behavior

### Desktop (> 768px)
- Full component with all details
- Sidebar always visible (md:block)
- Component width: Full sidebar width

### Tablet (768px - 1024px)
- Full component
- Sidebar toggleable with hamburger menu
- Component width: Full sidebar width when open

### Mobile (< 768px)
- Full component (or could use compact mode)
- Sidebar overlay when opened
- Component width: Full screen width when sidebar open

---

## Animation Details

### Progress Bar
- **Property:** `width` percentage
- **Duration:** 500ms
- **Easing:** `ease-out`
- **Trigger:** On component mount or balance update

### Low Balance Warning
- **Entry:** Fade in when balance drops below 20%
- **Exit:** Fade out when balance rises above 20%
- **Duration:** 300ms (matches UI.ANIMATION_DURATION)

### Number Formatting
- **Format:** US locale with thousands separator
- **Examples:**
  - `50000` → `50,000`
  - `1234` → `1,234`
  - `0` → `0`

---

## Accessibility Features

### Screen Reader Support
- All icons have descriptive labels
- Progress bar has aria-label with percentage
- Error messages are semantic `<p>` tags
- Warning uses appropriate ARIA role

### Keyboard Navigation
- Component is focusable (tab navigation)
- No interactive elements within (display only)
- Parent sidebar maintains focus management

### Contrast Ratios
All text meets WCAG AA standards:
- Green on black: 7.2:1
- Yellow on black: 6.8:1
- Red on black: 5.5:1
- White on black: 21:1 (maximum)

---

## Developer Notes

### Props Interface
```typescript
interface TokenBalanceProps {
  user: User;         // Required: User object with token fields
  compact?: boolean;  // Optional: Use compact display mode (default: false)
}
```

### Usage Example
```tsx
// Full mode (default)
<TokenBalance user={currentUser} />

// Compact mode
<TokenBalance user={currentUser} compact={true} />
```

### Conditional Rendering
```tsx
{currentUser && (
  <div className="p-4 border-b border-blue-900/30">
    <TokenBalance user={currentUser} />
  </div>
)}
```

Only renders when `currentUser` exists (logged in state).

---

## Testing Scenarios

### Visual Testing Checklist

1. **Healthy State (> 50%)**
   - Set balance: 30,000 tokens
   - Expected: Green color, no warning

2. **Warning State (20-50%)**
   - Set balance: 15,000 tokens
   - Expected: Yellow color, no warning

3. **Critical State (< 20%)**
   - Set balance: 5,000 tokens
   - Expected: Red color, low balance warning appears

4. **Very Low State (< 1000)**
   - Set balance: 500 tokens
   - Expected: Red color, warning, pre-send confirmation

5. **Empty State (0)**
   - Set balance: 0 tokens
   - Expected: Red color, all operations blocked with 402

6. **Edge: Exactly 50%**
   - Set balance: 25,000 tokens
   - Expected: Green color (>= 50%)

7. **Edge: Exactly 20%**
   - Set balance: 10,000 tokens
   - Expected: Yellow color (>= 20%)

---

**Component Version:** 1.0
**Last Updated:** 2025-12-12
**Maintained By:** FIDI.ai Development Team
