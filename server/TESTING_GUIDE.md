# Token System Testing Guide

## Quick Start

### 1. Start the Server

```bash
cd server
npm run dev
```

The server should log:
```
[UserStorage] Created data directory: /path/to/server/data
[TokenService] Created lock directory: /path/to/server/data/locks
[Security] JWT_SECRET validated successfully
[Server] FIDI Server running on port 3001
```

---

### 2. Create a Test User

**Register a new user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }' \
  -c cookies.txt \
  -w "\n"
```

**Expected Response:**
```json
{
  "user": {
    "id": "user-xxx",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Check logs for:**
```
[UserStorage] Created user: { id: 'user-xxx', email: 'test@example.com', tokenBalance: 50000 }
```

---

### 3. Check Token Balance

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt \
  -w "\n"
```

**Expected Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "user-xxx",
    "email": "test@example.com",
    "name": "Test User"
  },
  "tokens": {
    "balance": 50000,
    "usageThisMonth": 0,
    "daysUntilReset": 30
  }
}
```

---

### 4. Test Image Generation (5,000 tokens)

```bash
curl -X POST http://localhost:3001/api/media/image \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset"}' \
  -w "\n"
```

**Expected Response:**
```json
{
  "url": "https://replicate.delivery/...",
  "tokenBalance": 45000
}
```

**Check logs for:**
```
[TokenQuota] Pre-flight check passed: { userId: 'user-xxx', required: 5000, available: 50000 }
[Replicate] Prediction succeeded: { totalAttempts: 5, totalDuration: '8.2s' }
[TokenService] Tokens deducted: { userId: 'user-xxx', amount: 5000, reason: 'Image generation', previousBalance: 50000, newBalance: 45000, totalUsage: 5000 }
```

---

### 5. Test Video Generation (20,000 tokens)

```bash
curl -X POST http://localhost:3001/api/media/video \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A bird flying"}' \
  -w "\n"
```

**Expected Response:**
```json
{
  "url": "https://replicate.delivery/...",
  "tokenBalance": 25000
}
```

**Check logs for:**
```
[TokenQuota] Pre-flight check passed: { userId: 'user-xxx', required: 20000, available: 45000 }
[TokenService] Tokens deducted: { userId: 'user-xxx', amount: 20000, reason: 'Video generation', previousBalance: 45000, newBalance: 25000, totalUsage: 25000 }
```

---

### 6. Test Insufficient Tokens (402 Error)

Try to generate an image with only 2,000 tokens remaining:

**First, use up most tokens:**
```bash
# Generate 4 more videos to reach ~5,000 remaining
for i in {1..4}; do
  curl -X POST http://localhost:3001/api/media/video \
    -b cookies.txt \
    -H "Content-Type: application/json" \
    -d '{"prompt": "Test video '$i'"}' \
    -w "\n"
done
```

**Now balance should be ~5,000. Try image generation (needs 5,000):**
This will work but leave you with 0 tokens.

**Try another image (should fail):**
```bash
curl -X POST http://localhost:3001/api/media/image \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "This should fail"}' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (402):**
```json
{
  "error": "Insufficient tokens. Required: 5000, Available: 0. Tokens reset monthly.",
  "code": "INSUFFICIENT_TOKENS"
}
```

**Status Code:** 402 Payment Required

---

### 7. Test Chat with Dynamic Token Deduction

**Note:** This requires OpenRouter API key to be configured.

```bash
curl -X POST http://localhost:3001/api/chat/stream \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "model": "x-ai/grok-4.1-fast:free",
    "systemPrompt": "You are a helpful assistant",
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }' \
  -N
```

**Expected SSE Response:**
```
data: {"content":"Hello"}
data: {"content":","}
data: {"content":" how"}
data: {"content":" can"}
data: {"content":" I"}
data: {"content":" help"}
data: {"content":"?"}
data: {"usage":{"tokens":23,"newBalance":49977}}
data: [DONE]
```

**Check logs for:**
```
[TokenService] Tokens deducted: { userId: 'user-xxx', amount: 23, reason: 'Chat completion (x-ai/grok-4.1-fast:free)', previousBalance: 50000, newBalance: 49977, totalUsage: 23 }
```

---

### 8. Test Admin Operations

#### 8.1 Make Yourself Admin

Edit `server/data/users.json`:
```json
{
  "users": [
    {
      "id": "user-xxx",
      "email": "test@example.com",
      "name": "Test User",
      "tokenBalance": 0,
      "isAdmin": true
    }
  ]
}
```

#### 8.2 Grant Tokens

```bash
curl -X POST http://localhost:3001/api/admin/tokens/grant \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-xxx", "amount": 50000}' \
  -w "\n"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Granted 50000 tokens to user user-xxx",
  "newBalance": 50000
}
```

**Check logs for:**
```
[Admin] Tokens granted: { adminId: 'user-xxx', targetUserId: 'user-xxx', amount: 50000, newBalance: 50000 }
```

#### 8.3 Get User Stats

```bash
curl -X GET http://localhost:3001/api/admin/tokens/stats/user-xxx \
  -b cookies.txt \
  -w "\n"
```

**Expected Response:**
```json
{
  "userId": "user-xxx",
  "email": "test@example.com",
  "name": "Test User",
  "stats": {
    "tokenBalance": 50000,
    "tokenUsageTotal": 105000,
    "tokenUsageThisMonth": 105000,
    "lastTokenReset": 1702345678901,
    "daysUntilReset": 30
  }
}
```

#### 8.4 Get All Users Overview

```bash
curl -X GET http://localhost:3001/api/admin/tokens/overview \
  -b cookies.txt \
  -w "\n"
```

**Expected Response:**
```json
{
  "users": [
    {
      "userId": "user-xxx",
      "email": "test@example.com",
      "name": "Test User",
      "tokenBalance": 50000,
      "tokenUsageThisMonth": 105000,
      "tokenUsageTotal": 105000,
      "isAdmin": true
    }
  ]
}
```

---

### 9. Test Non-Admin Access (403 Error)

Remove admin flag from user in `server/data/users.json`:
```json
{
  "isAdmin": false
}
```

**Try to grant tokens:**
```bash
curl -X POST http://localhost:3001/api/admin/tokens/grant \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-xxx", "amount": 10000}' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response (403):**
```json
{
  "error": "Admin access required",
  "code": "FORBIDDEN"
}
```

**Status Code:** 403 Forbidden

**Check logs for:**
```
[Admin] Unauthorized access attempt: { userId: 'user-xxx' }
```

---

### 10. Test Monthly Reset

To test the monthly reset without waiting 30 days:

1. **Edit user in `server/data/users.json`:**
```json
{
  "lastTokenReset": 1670000000000,  // 31+ days ago
  "tokenBalance": 10000,
  "tokenUsageThisMonth": 40000
}
```

2. **Make any API call that checks tokens:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt \
  -w "\n"
```

3. **Check logs for:**
```
[TokenService] Monthly reset for user: { userId: 'user-xxx', daysSinceReset: 31.5, newBalance: 50000 }
```

4. **Verify response:**
```json
{
  "tokens": {
    "balance": 50000,
    "usageThisMonth": 0,
    "daysUntilReset": 30
  }
}
```

---

### 11. Test Thread Safety

Run multiple concurrent requests:

```bash
# Create a test script: test_concurrent.sh
cat > test_concurrent.sh << 'EOF'
#!/bin/bash
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/media/image \
    -b cookies.txt \
    -H "Content-Type: application/json" \
    -d '{"prompt": "Test '$i'"}' \
    -w "\n" &
done
wait
EOF

chmod +x test_concurrent.sh
./test_concurrent.sh
```

**Check logs for:**
```
[TokenService] Tokens deducted: { userId: 'user-xxx', amount: 5000, ... }
[TokenService] Tokens deducted: { userId: 'user-xxx', amount: 5000, ... }
```

**Verify final balance:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt \
  -w "\n"
```

Balance should be exactly: `50000 - (10 * 5000) = 0`

---

## Verification Checklist

- [ ] New users start with 50,000 tokens
- [ ] Image generation costs 5,000 tokens
- [ ] Video generation costs 20,000 tokens
- [ ] Chat uses dynamic tokens from OpenRouter
- [ ] 402 error when insufficient tokens
- [ ] Tokens reset to 50,000 after 30 days
- [ ] Admin can grant tokens
- [ ] Admin can view user stats
- [ ] Non-admin gets 403 on admin endpoints
- [ ] Concurrent requests handled correctly
- [ ] Failed operations don't deduct tokens
- [ ] Token balance returned in all responses

---

## Common Issues

### Issue: "OPENROUTER_API_KEY not configured"
**Solution:** Add your OpenRouter API key to `server/.env`:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Issue: "REPLICATE_API_KEY not configured"
**Solution:** Add your Replicate API key to `server/.env`:
```
REPLICATE_API_KEY=r8_your-key-here
```

### Issue: "JWT_SECRET environment variable is required"
**Solution:** Add a JWT secret to `server/.env`:
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

### Issue: Lock timeout errors
**Solution:** Check that `/server/data/locks/` directory exists and is writable. Clean up stale locks:
```bash
rm -rf server/data/locks/*.lock
```

### Issue: User migration not happening
**Solution:** The migration is lazy - it happens on first access. Try logging in or calling `/api/auth/me`.

---

## Clean Slate

To reset everything for fresh testing:

```bash
# Stop the server (Ctrl+C)

# Delete all data
rm -rf server/data/users.json
rm -rf server/data/locks/*.lock

# Restart the server
cd server && npm run dev
```

This will create a clean database and lock directory.
