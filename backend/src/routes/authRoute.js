import express from 'express';
import {register, login, logout, changePassword, getCurrentUser, refreshAccessToken,
    sendVerificationCode, verifyVerificationCode
    , sendForgotPasswordCode, verifyForgotPasswordCode, 
    allUsers,
    searchUsers} from '../controllers/authController.js';
import { isAuthenticated, checkRole } from '../middlewares/authenticateUser.js';
import rateLimit from 'express-rate-limit';
const router = express.Router();
import csrf from 'csurf';

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 requests per windowMs for auth routes
  message: { success: false, message: 'Too many attempts, please try again later' }
});
const csrfProtection = csrf({ cookie: true });

// Apply rate limit to auth routes
// Routes without CSRF (login, registration don't need CSRF initially)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshAccessToken);
router.get('/current-user', isAuthenticated,   getCurrentUser);

// Routes with CSRF protection (all state-changing operations after login)
router.post('/logout', isAuthenticated,  logout);
router.patch('/send-verification-code',    sendVerificationCode);
router.patch('/verify-verification-code', authLimiter,   verifyVerificationCode);
router.patch('/send-forgot-password-code',  sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', authLimiter,   verifyForgotPasswordCode);
router.patch('/change-password', authLimiter,   isAuthenticated, changePassword);

router.get('/all-users',   isAuthenticated, checkRole('admin'), allUsers);
router.get('/search',    isAuthenticated, checkRole('admin'), searchUsers);

export default router;


