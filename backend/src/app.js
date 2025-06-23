// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import authroutes from './routes/authRoute.js';
import enterprise from './routes/enterpriseRoutes.js';
import trainee from './routes/traineeRoutes.js';
import session from './routes/sessionRoutes.js';
import ticket from './routes/ticketRoutes.js';
import feature from './routes/featureRoutes.js';

import { isAuthenticated } from './middlewares/authenticateUser.js';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// CSRF protection
const csrfProtection = csrf({
   cookie: {
     httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
})

// Use morgan logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Routes
app.use('/api/auth', authroutes);
app.use('/api/enterprise', isAuthenticated, enterprise)
app.use('/api/trainee', isAuthenticated, trainee)
app.use('/api/session', isAuthenticated, session)
app.use('/api/feature', isAuthenticated, feature)
app.use('/api/ticket', isAuthenticated, ticket)

// Home Route
app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.stack);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB per file.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum allowed files exceeded.'
    });
  }
  
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }
  
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? statusCode === 500 ? 'Something went wrong!' : err.message
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;