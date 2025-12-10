# Security Implementation

This document outlines the security measures implemented in FIDI.ai to protect API keys and prevent abuse.

## Backend API Proxy Architecture

All API calls to OpenRouter and Replicate are routed through a secure backend proxy. This ensures API keys never reach the frontend.

### Flow Diagram
```
Frontend (localhost:3000)
    ↓ HTTP Request
Backend Proxy (localhost:3001)
    ↓ API Request with Secret Keys
External APIs (OpenRouter/Replicate)
```

## Security Features

### 1. Server-Side API Keys
- API keys stored in `/server/.env` (server-side only)
- Keys never exposed to frontend code or build artifacts
- Environment variables validated on server startup

### 2. Rate Limiting
Three layers of rate limiting prevent API abuse:

**General API Limiter** (`/api/*`)
- 100 requests per 15 minutes per IP
- Applies to all API routes

**AI Operation Limiter** (`/api/chat/*`, `/api/media/*`)
- 20 requests per minute per IP
- Prevents expensive AI operations abuse

**Authentication Limiter** (`/api/auth/*`)
- 5 login attempts per 15 minutes per IP
- Prevents brute force attacks
- Skips counting successful logins

### 3. Security Headers (Helmet.js)
- Content Security Policy (CSP)
- Cross-Origin Resource Policy
- Prevents XSS attacks
- Restricts resource loading

### 4. CORS Configuration
- Strict origin checking
- Credentials support
- Method whitelisting: GET, POST, PUT, DELETE
- Header whitelisting: Content-Type, Authorization

## File Structure

### Backend Files
```
server/
├── .env                    # API keys (NEVER commit)
├── .env.example           # Template for environment variables
├── src/
│   ├── index.ts           # Server with security middleware
│   ├── middleware/
│   │   ├── rateLimiter.ts # Rate limiting configuration
│   │   ├── errorHandler.ts # Error handling
│   │   └── auth.ts        # Authentication middleware
│   └── routes/
│       ├── chat.ts        # OpenRouter proxy
│       ├── media.ts       # Replicate proxy
│       └── auth.ts        # Authentication routes
```

### Frontend Files
```
/
├── .env.local             # Frontend config (VITE_API_URL only)
├── .env.example          # Template
├── lib/
│   └── apiClient.ts      # Backend API client
```

## Environment Variables

### Backend (`/server/.env`)
```bash
OPENROUTER_API_KEY=sk-or-v1-...    # OpenRouter API key
REPLICATE_API_KEY=r8_...           # Replicate API key
JWT_SECRET=...                      # JWT signing secret
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Frontend (`/.env.local`)
```bash
VITE_API_URL=http://localhost:3001  # Backend proxy URL
```

## Security Checklist

Before deploying to production:

- [ ] API keys are in `/server/.env` only
- [ ] Frontend `.env.local` contains no API keys
- [ ] Production build has zero API keys (verified via grep)
- [ ] Rate limiting is active
- [ ] CORS is configured for production domain
- [ ] Security headers are enabled
- [ ] Health check endpoint responds: `/api/health`
- [ ] Backend starts without errors
- [ ] Frontend connects to backend proxy
- [ ] All API calls go through backend (check Network tab)

## Testing Security

### 1. Verify API Keys Are Secure
```bash
# Build production frontend
npm run build

# Search for API keys in build (should return nothing)
grep -r "sk-or-v1" dist/
grep -r "r8_" dist/ | grep -v "minified"  # Exclude false positives from minified code
```

### 2. Test Rate Limiting
```bash
# Send 21 rapid requests (should get rate limited after 20)
for i in {1..21}; do
  curl -X POST http://localhost:3001/api/chat/stream \
    -H "Content-Type: application/json" \
    -d '{"model":"test","systemPrompt":"test","messages":[]}'
done
```

### 3. Test Health Endpoint
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 4. Verify CORS
```bash
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3001/api/health
# Should reject request from unauthorized origin
```

## Production Deployment

### Backend Deployment
1. Set environment variables on hosting platform
2. Never commit `.env` file
3. Use secrets manager for API keys
4. Update `CLIENT_URL` to production domain
5. Set `NODE_ENV=production`

### Frontend Deployment
1. Set `VITE_API_URL` to production backend URL
2. Build with `npm run build`
3. Deploy `/dist` folder
4. Verify no API keys in build artifacts

## Common Issues

### Issue: CORS errors in browser console
**Solution**: Verify `CLIENT_URL` in server `.env` matches frontend URL

### Issue: Rate limiting too aggressive
**Solution**: Adjust `max` values in `/server/src/middleware/rateLimiter.ts`

### Issue: API keys found in build
**Solution**:
1. Delete `/dist` folder
2. Remove API keys from frontend `.env.local`
3. Rebuild with `npm run build`
4. Verify with grep commands above

### Issue: Backend can't find API keys
**Solution**: Check `/server/.env` file exists with correct keys

## Security Best Practices

1. **Never commit API keys**
   - Use `.gitignore` to exclude `.env` files
   - Use `.env.example` for documentation only

2. **Rotate API keys regularly**
   - Update keys in server `.env` only
   - No code changes required

3. **Monitor API usage**
   - Check OpenRouter dashboard for unusual activity
   - Check Replicate dashboard for quota usage

4. **Use HTTPS in production**
   - All API calls must use HTTPS
   - Update `CLIENT_URL` and `VITE_API_URL` to https://

5. **Implement logging**
   - Log failed requests
   - Log rate limit violations
   - Monitor for suspicious patterns

## Rate Limit Response

When rate limited, clients receive:
```json
{
  "error": "Limite de requisições excedido. Aguarde 1 minuto.",
  "code": "AI_RATE_LIMIT"
}
```

HTTP Status: `429 Too Many Requests`

Headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Time when limit resets

## Additional Resources

- [Express Rate Limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [OpenRouter Security Best Practices](https://openrouter.ai/docs#security)
- [Replicate Security](https://replicate.com/docs/reference/http#authentication)
