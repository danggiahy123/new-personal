const express = require('express');
const esxiService = require('../services/esxiService');
// const VMActionLog = require('../models/VMActionLog'); // Commented out for MongoDB-free operation
const { protect } = require('../middleware/auth-simple');

const router = express.Router();

// Helper function to log VM actions (simplified without MongoDB)
const logVMAction = async (user, action, vmId, vmName, success, errorMessage, req) => {
  try {
    console.log(`VM Action: ${action} on ${vmName} (${vmId}) by ${user.username} - ${success ? 'SUCCESS' : 'FAILED'}`);
    if (errorMessage) {
      console.log(`Error: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Failed to log VM action:', error);
  }
};

// @route   GET /api/vms
// @desc    Get list of VMs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    const result = await esxiService.getVMs();
    
    if (result.success) {
      res.json({
        success: true,
        vms: result.vms,
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
    console.error('Get VMs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching VMs'
    });
  }
});

// @route   GET /api/vms/:id
// @desc    Get VM details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    const result = await esxiService.getVMDetails(id);
    
    if (result.success) {
      res.json({
        success: true,
        vm: result.vm,
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
    console.error('Get VM details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching VM details'
    });
  }
});

// @route   POST /api/vms/:id/start
// @desc    Start VM
// @access  Private
router.post('/:id/start', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    // Get VM name for logging
    const vmDetails = await esxiService.getVMDetails(id);
    const vmName = vmDetails.success ? vmDetails.vm.name : `VM-${id}`;

    const result = await esxiService.startVM(id);
    
    // Log the action
    await logVMAction(
      req.user, 
      'start', 
      id, 
      vmName, 
      result.success, 
      result.success ? null : result.message,
      req
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'VM start command sent successfully',
        vmId: id,
        vmName: vmName,
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
    console.error('Start VM error:', error);
    
    // Log the failed action
    await logVMAction(
      req.user, 
      'start', 
      req.params.id, 
      `VM-${req.params.id}`, 
      false, 
      error.message,
      req
    );

    res.status(500).json({
      success: false,
      message: 'Server error while starting VM'
    });
  }
});

// @route   POST /api/vms/:id/stop
// @desc    Stop VM
// @access  Private
router.post('/:id/stop', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    // Get VM name for logging
    const vmDetails = await esxiService.getVMDetails(id);
    const vmName = vmDetails.success ? vmDetails.vm.name : `VM-${id}`;

    const result = await esxiService.stopVM(id);
    
    // Log the action
    await logVMAction(
      req.user, 
      'stop', 
      id, 
      vmName, 
      result.success, 
      result.success ? null : result.message,
      req
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'VM stop command sent successfully',
        vmId: id,
        vmName: vmName,
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
    console.error('Stop VM error:', error);
    
    // Log the failed action
    await logVMAction(
      req.user, 
      'stop', 
      req.params.id, 
      `VM-${req.params.id}`, 
      false, 
      error.message,
      req
    );

    res.status(500).json({
      success: false,
      message: 'Server error while stopping VM'
    });
  }
});

// @route   POST /api/vms/:id/restart
// @desc    Restart VM
// @access  Private
router.post('/:id/restart', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ESXi is authenticated
    if (!esxiService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'ESXi not authenticated. Please login with ESXi credentials.'
      });
    }

    // Get VM name for logging
    const vmDetails = await esxiService.getVMDetails(id);
    const vmName = vmDetails.success ? vmDetails.vm.name : `VM-${id}`;

    const result = await esxiService.restartVM(id);
    
    // Log the action
    await logVMAction(
      req.user, 
      'restart', 
      id, 
      vmName, 
      result.success, 
      result.success ? null : result.message,
      req
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'VM restart command sent successfully',
        vmId: id,
        vmName: vmName,
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
    console.error('Restart VM error:', error);
    
    // Log the failed action
    await logVMAction(
      req.user, 
      'restart', 
      req.params.id, 
      `VM-${req.params.id}`, 
      false, 
      error.message,
      req
    );

    res.status(500).json({
      success: false,
      message: 'Server error while restarting VM'
    });
  }
});

module.exports = router;
