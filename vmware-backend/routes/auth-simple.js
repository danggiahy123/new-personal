const express = require('express');
const jwt = require('jsonwebtoken');
const esxiService = require('../services/esxiService');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Simple middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = { id: decoded.id, username: 'admin' }; // Simple user object
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user and authenticate with ESXi
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password, esxiUsername, esxiPassword } = req.body;

    // Simple validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // If ESXi credentials provided, authenticate with ESXi
    if (esxiUsername && esxiPassword) {
      const esxiLoginResult = await esxiService.login(esxiUsername, esxiPassword);
      
      if (!esxiLoginResult.success) {
        return res.status(401).json({
          success: false,
          message: 'ESXi authentication failed: ' + esxiLoginResult.message
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'ESXi credentials are required'
      });
    }

    // Generate token
    const token = generateToken('admin');

    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: 'admin',
        username: username,
        email: 'admin@example.com',
        role: 'admin',
        esxiAuthenticated: esxiService.isAuthenticated()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and ESXi
// @access  Private
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Logout from ESXi
    await esxiService.logout();

    // Clear cookie
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    const sessionInfo = esxiService.getSessionInfo();
    
    res.json({
      success: true,
      user: req.user,
      esxiSession: sessionInfo
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
