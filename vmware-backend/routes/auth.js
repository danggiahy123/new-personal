const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const esxiService = require('../services/esxiService');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/login
// @desc    Login user and authenticate with ESXi
// @access  Public
router.post('/login', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('esxiUsername')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('ESXi username cannot be empty'),
  body('esxiPassword')
    .optional()
    .notEmpty()
    .withMessage('ESXi password cannot be empty')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password, esxiUsername, esxiPassword } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
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

      // Update user's ESXi credentials
      user.esxiCredentials = {
        username: esxiUsername,
        password: esxiPassword,
        host: process.env.ESXI_HOST || 'https://192.168.159.128'
      };
      await user.save();
    } else if (user.esxiCredentials.username && user.esxiCredentials.password) {
      // Use stored ESXi credentials
      const esxiLoginResult = await esxiService.login(
        user.esxiCredentials.username, 
        user.esxiCredentials.password
      );
      
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

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

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
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
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
router.post('/logout', protect, async (req, res) => {
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
router.get('/me', protect, async (req, res) => {
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

// @route   POST /api/auth/register
// @desc    Register new user (Admin only)
// @access  Private/Admin
router.post('/register', protect, [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can register new users'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this username or email'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

module.exports = router;
