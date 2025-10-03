const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const VMActionLog = require('../models/VMActionLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password -esxiCredentials.password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/logs
// @desc    Get VM action logs (Admin only)
// @access  Private/Admin
router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.action) {
      query.action = req.query.action;
    }
    
    if (req.query.user) {
      query.user = req.query.user;
    }
    
    if (req.query.vmId) {
      query.vmId = req.query.vmId;
    }
    
    if (req.query.success !== undefined) {
      query.success = req.query.success === 'true';
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      if (req.query.startDate) {
        query.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    const logs = await VMActionLog.find(query)
      .populate('user', 'username email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VMActionLog.countDocuments(query);

    res.json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get system statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    const totalLogs = await VMActionLog.countDocuments();
    const successfulActions = await VMActionLog.countDocuments({ success: true });
    const failedActions = await VMActionLog.countDocuments({ success: false });

    // Action breakdown
    const actionStats = await VMActionLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          success: { $sum: { $cond: ['$success', 1, 0] } },
          failed: { $sum: { $cond: ['$success', 0, 1] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await VMActionLog.countDocuments({
      timestamp: { $gte: last24Hours }
    });

    // Top users by activity
    const topUsers = await VMActionLog.aggregate([
      {
        $group: {
          _id: '$user',
          username: { $first: '$username' },
          totalActions: { $sum: 1 },
          successfulActions: { $sum: { $cond: ['$success', 1, 0] } },
          failedActions: { $sum: { $cond: ['$success', 0, 1] } }
        }
      },
      {
        $sort: { totalActions: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers
        },
        logs: {
          total: totalLogs,
          successful: successfulActions,
          failed: failedActions,
          recent24h: recentActivity
        },
        actions: actionStats,
        topUsers: topUsers
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (Admin only)
// @access  Private/Admin
router.put('/users/:id', protect, authorize('admin'), [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from modifying themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own account'
      });
    }

    // Check if username/email is being changed and if it's already taken
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password -esxiCredentials.password');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
