const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ESXi Configuration
const ESXI_HOST = process.env.ESXI_HOST || 'https://192.168.159.128';
let sessionId = null;
let sessionUser = null;

// HTTPS Agent for self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Bypass self-signed SSL
});

// ESXi Service
const esxiService = {
  async login(username, password) {
    try {
      console.log(`🔐 Attempting ESXi login to ${ESXI_HOST} with user: ${username}`);
      
      const response = await axios.post(`${ESXI_HOST}/rest/com/vmware/cis/session`, {}, {
        auth: {
          username: username,
          password: password
        },
        httpsAgent: httpsAgent,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      sessionId = response.data.value;
      sessionUser = username;
      
      console.log(`✅ ESXi login successful for user: ${username}`);
      return {
        success: true,
        sessionId: sessionId,
        message: 'ESXi authentication successful'
      };
    } catch (error) {
      console.error('❌ ESXi login error:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      return {
        success: false,
        message: error.response?.data?.message || `ESXi login failed: ${error.message}`
      };
    }
  },

  async getVMs() {
    try {
      if (!sessionId) {
        throw new Error('Not authenticated with ESXi');
      }

      console.log('📋 Fetching VMs from ESXi...');
      
      const response = await axios.get(`${ESXI_HOST}/rest/vcenter/vm`, {
        headers: {
          'vmware-api-session-id': sessionId,
          'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent,
        timeout: 15000
      });

      // Transform data to simpler format
      const vms = response.data.value.map(vm => ({
        id: vm.vm,
        name: vm.name,
        power_state: vm.power_state,
        cpu: vm.cpu_count || 0,
        memory_size: vm.memory_size_MiB ? vm.memory_size_MiB * 1024 * 1024 : 0,
        guest_os: vm.guest_OS || 'Unknown',
        hardware_version: vm.hardware_version || 'Unknown'
      }));

      console.log(`✅ Found ${vms.length} VMs`);
      return {
        success: true,
        data: vms
      };
    } catch (error) {
      console.error('❌ Get VMs error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || `Failed to fetch VMs: ${error.message}`,
        data: []
      };
    }
  },

  async vmAction(vmId, action) {
    try {
      if (!sessionId) {
        throw new Error('Not authenticated with ESXi');
      }

      console.log(`🔄 Executing ${action} on VM: ${vmId}`);
      
      const response = await axios.post(
        `${ESXI_HOST}/rest/vcenter/vm/${vmId}/power/${action}`,
        {},
        {
          headers: {
            'vmware-api-session-id': sessionId,
            'Content-Type': 'application/json'
          },
          httpsAgent: httpsAgent,
          timeout: 30000 // Longer timeout for VM operations
        }
      );

      console.log(`✅ VM ${action} successful for VM: ${vmId}`);
      return {
        success: true,
        message: `VM ${action} successful`
      };
    } catch (error) {
      console.error(`❌ VM ${action} error:`, error.message);
      return {
        success: false,
        message: error.response?.data?.message || `Failed to ${action} VM: ${error.message}`
      };
    }
  },

  async getVMDetails(vmId) {
    try {
      if (!sessionId) {
        throw new Error('Not authenticated with ESXi');
      }

      const response = await axios.get(`${ESXI_HOST}/rest/vcenter/vm/${vmId}`, {
        headers: {
          'vmware-api-session-id': sessionId,
          'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent,
        timeout: 15000
      });

      return {
        success: true,
        data: response.data.value
      };
    } catch (error) {
      console.error('❌ Get VM details error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || `Failed to fetch VM details: ${error.message}`
      };
    }
  },

  async logout() {
    try {
      if (sessionId) {
        await axios.delete(`${ESXI_HOST}/rest/com/vmware/cis/session`, {
          headers: {
            'vmware-api-session-id': sessionId
          },
          httpsAgent: httpsAgent,
          timeout: 10000
        });
        console.log('✅ ESXi logout successful');
      }
    } catch (error) {
      console.error('❌ ESXi logout error:', error.message);
    } finally {
      sessionId = null;
      sessionUser = null;
    }
  }
};

// Routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, esxiUsername, esxiPassword } = req.body;

    if (!username || !password || !esxiUsername || !esxiPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Simple authentication (no database)
    if (username !== 'admin' || password !== 'admin123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Login to ESXi
    const esxiResult = await esxiService.login(esxiUsername, esxiPassword);
    
    if (!esxiResult.success) {
      return res.status(401).json({
        success: false,
        message: 'ESXi authentication failed: ' + esxiResult.message
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      sessionId: esxiResult.sessionId,
      user: {
        username: username,
        role: 'admin',
        esxiUser: esxiUsername
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.get('/api/vms', async (req, res) => {
  try {
    const result = await esxiService.getVMs();
    res.json(result);
  } catch (error) {
    console.error('❌ Get VMs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      data: []
    });
  }
});

app.post('/api/vms/:id/start', async (req, res) => {
  try {
    const result = await esxiService.vmAction(req.params.id, 'start');
    res.json(result);
  } catch (error) {
    console.error('❌ Start VM error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/vms/:id/stop', async (req, res) => {
  try {
    const result = await esxiService.vmAction(req.params.id, 'stop');
    res.json(result);
  } catch (error) {
    console.error('❌ Stop VM error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/vms/:id/restart', async (req, res) => {
  try {
    const result = await esxiService.vmAction(req.params.id, 'reset');
    res.json(result);
  } catch (error) {
    console.error('❌ Restart VM error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/vms/:id/suspend', async (req, res) => {
  try {
    const result = await esxiService.vmAction(req.params.id, 'suspend');
    res.json(result);
  } catch (error) {
    console.error('❌ Suspend VM error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/vms/:id', async (req, res) => {
  try {
    const result = await esxiService.getVMDetails(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('❌ Get VM details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    await esxiService.logout();
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Production VMware ESXi API Server is running',
    esxiHost: ESXI_HOST,
    sessionActive: !!sessionId,
    sessionUser: sessionUser,
    mode: 'PRODUCTION'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await esxiService.logout();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Production VMware ESXi API Server running on port ${PORT}`);
  console.log(`🌐 ESXi Host: ${ESXI_HOST}`);
  console.log(`🔐 Admin credentials: admin / admin123`);
  console.log(`🔒 SSL: Self-signed certificates bypassed`);
  console.log(`⚡ Mode: PRODUCTION - Real ESXi API calls`);
});
