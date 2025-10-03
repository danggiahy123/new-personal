const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ESXi Configuration
const ESXI_HOST = process.env.ESXI_HOST || 'https://192.168.159.128';
let sessionId = null;

// Simple ESXi Service
const esxiService = {
  async login(username, password) {
    try {
      // ESXi của bạn sử dụng JSON-RPC API
      const payload = {
        jsonrpc: '2.0',
        method: 'login',
        params: {
          username: username,
          password: password
        },
        id: 1
      };

      const response = await axios.post(`${ESXI_HOST}/api/session`, payload, {
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false // Bypass self-signed SSL
        }),
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.result) {
        sessionId = response.data.result;
        return {
          success: true,
          sessionId: sessionId,
          message: 'ESXi login successful'
        };
      } else {
        return {
          success: false,
          message: 'ESXi login failed - invalid response'
        };
      }
    } catch (error) {
      console.error('ESXi login error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'ESXi login failed'
      };
    }
  },

  async getVMs() {
    try {
      if (!sessionId) {
        throw new Error('Not authenticated with ESXi');
      }

      // Sử dụng JSON-RPC API
      const payload = {
        jsonrpc: '2.0',
        method: 'getVMs',
        params: {},
        id: Date.now()
      };

      const response = await axios.post(`${ESXI_HOST}/api/session`, payload, {
        headers: {
          'vmware-api-session-id': sessionId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        }),
        timeout: 10000
      });

      if (response.data && response.data.result) {
        // Transform data to simpler format
        const vms = response.data.result.map(vm => ({
          id: vm.vm || vm.id,
          name: vm.name,
          power_state: vm.power_state,
          cpu: vm.cpu_count || vm.cpu || 0,
          memory_size: vm.memory_size_MiB ? vm.memory_size_MiB * 1024 * 1024 : 0
        }));

        return {
          success: true,
          data: vms
        };
      } else {
        return {
          success: false,
          message: 'Failed to get VMs - invalid response'
        };
      }
    } catch (error) {
      console.error('Get VMs error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch VMs'
      };
    }
  },

  async vmAction(vmId, action) {
    try {
      if (!sessionId) {
        throw new Error('Not authenticated with ESXi');
      }

      const response = await axios.post(
        `${ESXI_HOST}/rest/vcenter/vm/${vmId}/power/${action}`,
        {},
        {
          headers: {
            'vmware-api-session-id': sessionId
          },
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false
          }),
          timeout: 10000
        }
      );

      return {
        success: true,
        message: `VM ${action} successful`
      };
    } catch (error) {
      console.error(`VM ${action} error:`, error.message);
      return {
        success: false,
        message: error.response?.data?.message || `Failed to ${action} VM`
      };
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
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/vms', async (req, res) => {
  try {
    const result = await esxiService.getVMs();
    res.json(result);
  } catch (error) {
    console.error('Get VMs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/vms/:id/start', async (req, res) => {
  try {
    const result = await esxiService.vmAction(req.params.id, 'start');
    res.json(result);
  } catch (error) {
    console.error('Start VM error:', error);
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
    console.error('Stop VM error:', error);
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
    console.error('Restart VM error:', error);
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
    console.error('Suspend VM error:', error);
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
    message: 'Server is running',
    esxiHost: ESXI_HOST,
    sessionActive: !!sessionId
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple VMware ESXi API Server running on port ${PORT}`);
  console.log(`🌐 ESXi Host: ${ESXI_HOST}`);
  console.log(`📝 No MongoDB required - Direct ESXi API calls`);
  console.log(`🔐 Admin credentials: admin / admin123`);
});
