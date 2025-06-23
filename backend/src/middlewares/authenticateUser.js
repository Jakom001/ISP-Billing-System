import jwt from 'jsonwebtoken';
import Auth from '../models/authModel.js';
import dotenv from 'dotenv';
dotenv.config();

const isAuthenticated = (req, res, next) => {
  // Only check cookies for authentication
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Please login first' 
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    
    // For token expiration, return specific error code
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired', 
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    // For any other error, clear the auth cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
    });
    
    res.clearCookie('isLoggedIn', {
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized' 
    });
  }
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({error: "You need to be logged in to access this route"});
        }
        if (!roles.includes(req.user.role)){
            return res.status(403).json({error: "You are not authorized to access this route"});
        }
        next();
    };
};

const isVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "You need to be logged in to access this route" });
    }
    
    if (!req.user.verified) {
        return res.status(403).json({ error: "Your account is not verified. Please verify your email to access this feature." });
    }
    
    next();
};

export {isAuthenticated, checkRole, isVerified};