const express = require('express');
const esxiService = require('../services/esxiService');
const { protect } = require('../middleware/auth-simple');

const router = express.Router();

// @route   GET /api/host/services
// @desc    Get ESXi host services information
// @access  Private
router.get('/services', protect, async (req, res) => {
  try {
    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    const result = await esxiService.getServices();
    
    if (result.success) {
      res.json({
        success: true,
        services: result.services,
        count: result.count,
        endpoint: result.endpoint,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services'
    });
  }
});

// @route   GET /api/host/info
// @desc    Get ESXi host information
// @access  Private
router.get('/info', protect, async (req, res) => {
  try {
    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    const result = await esxiService.getHostInfo();
    
    if (result.success) {
      res.json({
        success: true,
        hosts: result.hosts,
        count: result.count,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get host info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching host information'
    });
  }
});

// @route   GET /api/host/storage
// @desc    Get ESXi host storage information
// @access  Private
router.get('/storage', protect, async (req, res) => {
  try {
    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    const result = await esxiService.getStorageInfo();
    
    if (result.success) {
      res.json({
        success: true,
        datastores: result.datastores,
        count: result.count,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get storage info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching storage information'
    });
  }
});

// @route   GET /api/host/networking
// @desc    Get ESXi host networking information
// @access  Private
router.get('/networking', protect, async (req, res) => {
  try {
    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    const result = await esxiService.getNetworkingInfo();
    
    if (result.success) {
      res.json({
        success: true,
        networks: result.networks,
        count: result.count,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get networking info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching networking information'
    });
  }
});

// @route   GET /api/host/status
// @desc    Get ESXi connection status and session info
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const sessionInfo = esxiService.getSessionInfo();
    
    res.json({
      success: true,
      status: sessionInfo.authenticated ? 'connected' : 'disconnected',
      sessionInfo: sessionInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get host status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching host status'
    });
  }
});

module.exports = router;
