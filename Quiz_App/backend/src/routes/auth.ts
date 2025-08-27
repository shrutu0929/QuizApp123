import express from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../config/jwt';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    // Register user in our store
    const newUser = await User.create({
      username,
      email,
      password,
            role: 'player',
            level: 1,
            experience: 0,
            totalQuizzesAttempted: 0,
            averageScore: 0,
            highestScore: 0,
            badges: []
          });

    // Generate JWT tokens
    const accessToken = generateAccessToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    const refreshToken = generateRefreshToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    // Persist refresh token
    await RefreshToken.create({
      user: newUser._id,
      token: refreshToken,
      userAgent: req.headers['user-agent'] as string,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip
    });

    // Return user data (without password)
    const userWithoutPassword = newUser.toJSON();
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message === 'User already exists') {
      return res.status(400).json({
        success: false,
        message: 'Username or email is already taken'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
              const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password - handle both old and new password formats
    let isPasswordValid = false;
    try {
      // Try the User model's comparePassword method first
      isPasswordValid = await user.comparePassword(password);
    } catch (error) {
      // Fallback to direct bcrypt comparison for older users
      isPasswordValid = await bcrypt.compare(password, user.password);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Optional: Invalidate previous refresh tokens for this device or user
    // For simplicity, allow multiple tokens and just store this one
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      userAgent: req.headers['user-agent'] as string,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip
    });

    // Return user data (without password)
    const userWithoutPassword = user.toJSON();
    
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Lookup refresh token in DB
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.revokedAt) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Verify signature and decode
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { verify } = require('jsonwebtoken');
      const { jwtConfig } = require('../config/jwt');
      const decoded = verify(refreshToken, jwtConfig.refreshSecret) as any;

      const user = await User.findById(stored.user);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Issue new access token
      const newAccessToken = generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      return res.json({
        success: true,
        message: 'Access token refreshed',
        data: { accessToken: newAccessToken }
      });
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user data (without password)
    const userWithoutPassword = user.toJSON();
    
    return res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   GET /api/auth/users (for debugging)
// @desc    Get all users (temporary, remove in production)
// @access  Public
router.get('/users', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  return res.status(410).json({ success: false, message: 'Endpoint removed' });
});

export default router;
