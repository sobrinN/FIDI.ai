# Quick Start Guide

This guide helps you get FIDI.ai running locally with proper security.

## Prerequisites

- Node.js 18+ installed
- OpenRouter API key ([get one here](https://openrouter.ai/keys))
- Replicate API key ([get one here](https://replicate.com/account/api-tokens))

## Setup (5 minutes)

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Backend API Keys

Create `/server/.env` file:

```bash
cd server
cp .env.example .env
```

Edit `/server/.env` with your actual API keys:

```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_HERE
REPLICATE_API_KEY=r8_YOUR_ACTUAL_KEY_HERE
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

**IMPORTANT**: Never commit this file! It's already in `.gitignore`.

### Step 3: Configure Frontend

Create `/.env.local` file:

```bash
cd ..  # Return to root
cp .env.example .env.local
```

Content of `/.env.local`:

```env
VITE_API_URL=http://localhost:3001
```

**NOTE**: The frontend `.env.local` should NEVER contain API keys!

## Running the Application

### Option 1: Development Mode (Recommended)

Open two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

You should see:
```
🚀 FIDI Server running on port 3001
📡 CORS enabled for: http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
  VITE v6.4.1  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Option 2: Production Build

```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build
cd ..

# Start backend
cd server
npm start &

# Preview frontend
npm run preview
```

## Verify Security

After starting, verify API keys are secure:

```bash
# Check that API keys are server-side only
grep -r "sk-or-v1" dist/  # Should return nothing
grep -r "OPENROUTER_API_KEY" components/ lib/  # Should return nothing

# Test health endpoint
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

## Testing the Application

1. Open http://localhost:3000 in your browser
2. You'll see the landing page
3. Click "Entrar" to access the auth page
4. Login with any credentials (mock auth for now)
5. You'll be redirected to the chat interface
6. Select an agent (FIDI, TUNIN, MORCEGO, or NENECA)
7. Start chatting!

### Testing Features

**Chat with AI:**
- Select FIDI agent
- Type: "Explain clean code principles"
- Watch streaming response

**Image Generation:**
- Select NENECA agent
- Type: "Gere uma imagem de um gato astronauta"
- Wait for image generation (~10 seconds)

**Video Generation:**
- Select NENECA agent
- Type: "Gere um vídeo de ondas do mar"
- Wait for video generation (~30 seconds)

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001
# Kill the process if needed
kill -9 <PID>

# Verify .env file exists
ls -la server/.env
```

### Frontend can't connect to backend
```bash
# Check .env.local has correct URL
cat .env.local
# Should show: VITE_API_URL=http://localhost:3001

# Verify backend is running
curl http://localhost:3001/api/health
```

### CORS errors
```bash
# Check CLIENT_URL in server/.env
cat server/.env | grep CLIENT_URL
# Should match your frontend URL (usually http://localhost:3000)
```

### Rate limiting errors
If you see "Limite de requisições excedido":
- Wait 1 minute
- You hit the 20 requests/minute limit
- This is normal security behavior

### API key errors
If you see "OPENROUTER_API_KEY not configured":
1. Check `/server/.env` file exists
2. Verify API key is correct
3. Restart the backend server

## Project Structure

```
FIDI.ai/
├── server/              # Backend API proxy
│   ├── .env            # API keys (DO NOT COMMIT)
│   ├── src/
│   │   ├── index.ts    # Server with security
│   │   ├── routes/     # API routes
│   │   └── middleware/ # Rate limiting, auth
│   └── package.json
├── components/          # React components
├── lib/                # Frontend utilities
│   └── apiClient.ts    # Backend API client
├── config/             # Agent configurations
├── .env.local          # Frontend config (VITE_API_URL only)
└── package.json
```

## Development Workflow

### Making Changes

**Frontend changes:**
1. Edit files in `/components`, `/lib`, or root `.tsx/.ts` files
2. Vite will hot-reload automatically
3. No restart needed

**Backend changes:**
1. Edit files in `/server/src`
2. Server will auto-restart (using `tsx watch`)
3. No manual restart needed

### Adding New Features

1. Frontend UI: Edit components
2. Backend API: Add routes in `/server/src/routes`
3. API client: Update `/lib/apiClient.ts`

## Next Steps

- Read [SECURITY.md](./SECURITY.md) for security details
- Read [CLAUDE.md](./CLAUDE.md) for architecture overview
- Check [config/agents.ts](./config/agents.ts) for agent configurations

## Production Deployment

See [SECURITY.md](./SECURITY.md#production-deployment) for production deployment instructions.

**Remember:**
- Never commit API keys
- Always use environment variables
- Test security before deploying
- Use HTTPS in production

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in browser console
3. Check backend logs in the terminal
4. Verify all environment variables are set correctly

## Important Security Notes

- API keys are stored server-side only (`/server/.env`)
- Frontend never has access to API keys
- All API calls go through the backend proxy
- Rate limiting prevents abuse
- Production builds contain zero API keys
