# Token System API Endpoints

## User Endpoints

### Get Current User with Token Stats
```
GET /api/auth/me
Headers: Cookie: auth_token=<jwt>
```

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "user-xxx",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "tokens": {
    "balance": 50000,
    "usageThisMonth": 5000,
    "daysUntilReset": 25
  }
}
```

---

## Chat Endpoint (Dynamic Cost)

### Stream Chat Completion
```
POST /api/chat/stream
Headers: Cookie: auth_token=<jwt>
Content-Type: application/json

Body:
{
  "model": "x-ai/grok-4.1-fast:free",
  "systemPrompt": "You are a helpful assistant",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

**SSE Response:**
```
data: {"content": "Hello! How can I help you?"}

data: {"usage": {"tokens": 1234, "newBalance": 48766}}

data: [DONE]
```

**Cost:** Dynamic (based on OpenRouter usage)

---

## Media Endpoints (Fixed Cost)

### Generate Image
```
POST /api/media/image
Headers: Cookie: auth_token=<jwt>
Content-Type: application/json

Body:
{
  "prompt": "A beautiful sunset over mountains"
}
```

**Response:**
```json
{
  "url": "https://replicate.delivery/...",
  "tokenBalance": 45000
}
```

**Cost:** 5,000 tokens

**Error (Insufficient Tokens):**
```json
{
  "error": "Insufficient tokens. Required: 5000, Available: 2000. Tokens reset monthly.",
  "code": "INSUFFICIENT_TOKENS"
}
```
**Status:** 402 Payment Required

---

### Generate Video
```
POST /api/media/video
Headers: Cookie: auth_token=<jwt>
Content-Type: application/json

Body:
{
  "prompt": "A bird flying through clouds"
}
```

**Response:**
```json
{
  "url": "https://replicate.delivery/...",
  "tokenBalance": 25000
}
```

**Cost:** 20,000 tokens

**Error (Insufficient Tokens):**
```json
{
  "error": "Insufficient tokens. Required: 20000, Available: 15000. Tokens reset monthly.",
  "code": "INSUFFICIENT_TOKENS"
}
```
**Status:** 402 Payment Required

---

## Admin Endpoints

### Grant Tokens to User
```
POST /api/admin/tokens/grant
Headers: Cookie: auth_token=<jwt> (admin required)
Content-Type: application/json

Body:
{
  "userId": "user-xxx",
  "amount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Granted 10000 tokens to user user-xxx",
  "newBalance": 60000
}
```

**Validation:**
- Amount must be positive number
- Amount cannot exceed 1,000,000 tokens
- Requires admin flag (`isAdmin: true`)

**Error (Non-Admin):**
```json
{
  "error": "Admin access required",
  "code": "FORBIDDEN"
}
```
**Status:** 403 Forbidden

---

### Get User Token Stats
```
GET /api/admin/tokens/stats/:userId
Headers: Cookie: auth_token=<jwt> (admin required)
```

**Response:**
```json
{
  "userId": "user-xxx",
  "email": "user@example.com",
  "name": "John Doe",
  "stats": {
    "tokenBalance": 50000,
    "tokenUsageTotal": 25000,
    "tokenUsageThisMonth": 5000,
    "lastTokenReset": 1702345678901,
    "daysUntilReset": 25
  }
}
```

---

### Get All Users Overview
```
GET /api/admin/tokens/overview
Headers: Cookie: auth_token=<jwt> (admin required)
```

**Response:**
```json
{
  "users": [
    {
      "userId": "user-xxx",
      "email": "user1@example.com",
      "name": "User One",
      "tokenBalance": 50000,
      "tokenUsageThisMonth": 5000,
      "tokenUsageTotal": 25000,
      "isAdmin": false
    },
    {
      "userId": "user-yyy",
      "email": "admin@example.com",
      "name": "Admin User",
      "tokenBalance": 50000,
      "tokenUsageThisMonth": 0,
      "tokenUsageTotal": 0,
      "isAdmin": true
    }
  ]
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INSUFFICIENT_TOKENS` | 402 | User doesn't have enough tokens for the operation |
| `FORBIDDEN` | 403 | User is not an admin |
| `NO_USER` | 401 | Authentication required or user not found |
| `INVALID_USER_ID` | 400 | Invalid userId in request |
| `INVALID_AMOUNT` | 400 | Invalid token amount (must be positive) |
| `AMOUNT_TOO_LARGE` | 400 | Token grant amount exceeds 1,000,000 |
| `USER_NOT_FOUND` | 404 | Target user doesn't exist |
| `GRANT_FAILED` | 500 | Failed to grant tokens |
| `STATS_ERROR` | 500 | Failed to retrieve usage statistics |

---

## Token Costs Reference

| Operation | Cost | Auto-Reset |
|-----------|------|------------|
| Chat (LLM) | Dynamic | Monthly (30 days) |
| Image Generation | 5,000 | Monthly (30 days) |
| Video Generation | 20,000 | Monthly (30 days) |
| **Default Balance** | **50,000** | **Monthly (30 days)** |

---

## Example cURL Commands

### Check Balance
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -w "\n"
```

### Generate Image
```bash
curl -X POST http://localhost:3001/api/media/image \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A sunset over mountains"}' \
  -w "\n"
```

### Grant Tokens (Admin)
```bash
curl -X POST http://localhost:3001/api/admin/tokens/grant \
  -H "Cookie: auth_token=ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-xxx", "amount": 10000}' \
  -w "\n"
```

### Get All Users (Admin)
```bash
curl -X GET http://localhost:3001/api/admin/tokens/overview \
  -H "Cookie: auth_token=ADMIN_JWT_TOKEN" \
  -w "\n"
```
