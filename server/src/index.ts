import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat.js';
import { mediaRouter } from './routes/media.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter, aiLimiter, authLimiter, registrationLimiter } from './middleware/rateLimiter.js';
import { authMiddleware } from './middleware/auth.js';

// Load environment variables first
dotenv.config();

// Constants
const MIN_JWT_SECRET_LENGTH = 32;
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Validate required environment variables at startup
 * Server will refuse to start if critical configs are missing or insecure
 */
function validateEnvironment(): void {
  const jwtSecret = process.env.JWT_SECRET;

  // Validate JWT_SECRET exists
  if (!jwtSecret) {
    console.error('\n============================================================');
    console.error('FATAL ERROR: JWT_SECRET environment variable is required');
    console.error('============================================================');
    console.error('Please set JWT_SECRET in server/.env file.');
    console.error('Example: JWT_SECRET=your-super-secret-key-at-least-32-chars');
    console.error('============================================================\n');
    process.exit(1);
  }

  // Validate JWT_SECRET length
  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    console.error('\n============================================================');
    console.error('FATAL ERROR: JWT_SECRET is too short');
    console.error('============================================================');
    console.error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters.`);
    console.error(`Current length: ${jwtSecret.length} characters`);
    console.error('============================================================\n');
    process.exit(1);
  }

  // Warn about common insecure secrets
  const insecureSecrets = [
    'your-super-secret-jwt-key-min-32-chars',
    'secret',
    'password',
    'jwt_secret',
    'change-me',
    'changeme'
  ];

  if (insecureSecrets.some(s => jwtSecret.toLowerCase().includes(s.toLowerCase()))) {
    console.warn('\n============================================================');
    console.warn('WARNING: JWT_SECRET appears to be insecure');
    console.warn('============================================================');
    console.warn('Please use a cryptographically random secret in production.');
    console.warn('Generate one with: openssl rand -base64 48');
    console.warn('============================================================\n');
  }

  console.log('[Security] JWT_SECRET validated successfully');
}

// Validate environment before starting server
validateEnvironment();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", CLIENT_URL, "https://openrouter.ai", "https://api.replicate.com"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      mediaSrc: ["'self'", 'https:', 'http:'],
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Fixed for proper cookie handling
// When credentials: true, origin cannot be '*'
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin matches allowed origins
    const allowedOrigins = [
      CLIENT_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow any localhost origin
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Apply rate limiting
app.use('/api/', apiLimiter); // General limit on all API routes
app.use('/api/chat/', aiLimiter); // Stricter limit on AI chat
app.use('/api/media/', aiLimiter); // Stricter limit on media generation
app.use('/api/auth/login', authLimiter); // Prevent brute force on login
app.use('/api/auth/register', registrationLimiter); // More lenient for registration

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter); // Public - needed for login/register
app.use('/api/chat', authMiddleware, chatRouter); // Protected - requires authentication
app.use('/api/media', authMiddleware, mediaRouter); // Protected - requires authentication
app.use('/api/admin', authMiddleware, adminRouter); // Protected - requires admin authentication

// Error handling (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] FIDI Server running on port ${PORT}`);
  console.log(`[CORS] Enabled for: ${CLIENT_URL}`);
  console.log(`[Environment] ${process.env.NODE_ENV || 'development'}`);
});
