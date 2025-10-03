const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const ESXI_HOST = process.env.ESXI_HOST || 'https://192.168.159.128';
const DEMO_MODE = process.env.DEMO_MODE === 'true' || false;

let sessionId = null;
let sessionUser = null;

// HTTPS Agent for self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Mock VMs data for demo mode
const mockVMs = [
  {
    id: "vm-001",
    name: "Ubuntu Server 20.04",
    power_state: "POWERED_ON",
    cpu: 2,
    memory_size: 4294967296,
    guest_os: "Ubuntu Linux (64-bit)",
    hardware_version: "vmx-19"
  },
  {
    id: "vm-002", 
    name: "Windows Server 2019",
    power_state: "POWERED_OFF",
    cpu: 4,
    memory_size: 8589934592,
    guest_os: "Windows Server 2019 (64-bit)",
    hardware_version: "vmx-19"
  },
  {
    id: "vm-003",
    name: "CentOS 8",
    power_state: "POWERED_ON", 
    cpu: 1,
    memory_size: 2147483648,
    guest_os: "CentOS 8 (64-bit)",
    hardware_version: "vmx-19"
  }
];

// ESXi Service
const esxiService = {
  async login(username, password) {
    if (DEMO_MODE) {
      console.log(`🎭 Demo Mode: Mock ESXi login for user: ${username}`);
      sessionId = 'demo-session-' + Date.now();
      sessionUser = username;
      return {
        success: true,
        sessionId: sessionId,
        message: 'Demo ESXi authentication successful'
      };
    }

    try {
      console.log(`🔐 Production Mode: Attempting ESXi login to ${ESXI_HOST} with user: ${username}`);
      
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
      
      // Fallback to demo mode if ESXi fails
      console.log('🔄 Falling back to Demo Mode...');
      sessionId = 'fallback-session-' + Date.now();
      sessionUser = username;
      return {
        success: true,
        sessionId: sessionId,
        message: 'ESXi connection failed, using Demo Mode'
      };
    }
  },

  async getVMs() {
    if (DEMO_MODE || !sessionId || sessionId.startsWith('demo') || sessionId.startsWith('fallback')) {
      console.log('🎭 Demo Mode: Returning mock VMs');
      return {
        success: true,
        data: mockVMs
      };
    }

    try {
      console.log('📋 Production Mode: Fetching VMs from ESXi...');
      
      const response = await axios.get(`${ESXI_HOST}/rest/vcenter/vm`, {
        headers: {
          'vmware-api-session-id': sessionId,
          'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent,
        timeout: 15000
      });

      const vms = response.data.value.map(vm => ({
        id: vm.vm,
        name: vm.name,
        power_state: vm.power_state,
        cpu: vm.cpu_count || 0,
        memory_size: vm.memory_size_MiB ? vm.memory_size_MiB * 1024 * 1024 : 0,
        guest_os: vm.guest_OS || 'Unknown',
        hardware_version: vm.hardware_version || 'Unknown'
      }));

      console.log(`✅ Found ${vms.length} VMs from ESXi`);
      return {
        success: true,
        data: vms
      };
    } catch (error) {
      console.error('❌ Get VMs error:', error.message);
      console.log('🔄 Falling back to Demo Mode for VMs...');
      return {
        success: true,
        data: mockVMs
      };
    }
  },

  async vmAction(vmId, action) {
    if (DEMO_MODE || !sessionId || sessionId.startsWith('demo') || sessionId.startsWith('fallback')) {
      console.log(`🎭 Demo Mode: Mock VM ${action} for VM: ${vmId}`);
      
      const vm = mockVMs.find(v => v.id === vmId);
      if (vm) {
        if (action === 'start') vm.power_state = "POWERED_ON";
        else if (action === 'stop') vm.power_state = "POWERED_OFF";
        else if (action === 'suspend') vm.power_state = "SUSPENDED";
        
        return {
          success: true,
          message: `VM ${vm.name} ${action} successful (Demo Mode)`
        };
      }
      
      return {
        success: false,
        message: 'VM not found'
      };
    }

    try {
      console.log(`🔄 Production Mode: Executing ${action} on VM: ${vmId}`);
      
      const response = await axios.post(
        `${ESXI_HOST}/rest/vcenter/vm/${vmId}/power/${action}`,
        {},
        {
          headers: {
            'vmware-api-session-id': sessionId,
            'Content-Type': 'application/json'
          },
          httpsAgent: httpsAgent,
          timeout: 30000
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

  async logout() {
    if (DEMO_MODE || !sessionId || sessionId.startsWith('demo') || sessionId.startsWith('fallback')) {
      console.log('🎭 Demo Mode: Mock logout');
      sessionId = null;
      sessionUser = null;
      return;
    }

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

    // Simple authentication
    if (username !== 'admin' || password !== 'admin123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Login to ESXi
    const esxiResult = await esxiService.login(esxiUsername, esxiPassword);
    
    res.json({
      success: true,
      message: esxiResult.message,
      sessionId: esxiResult.sessionId,
      user: {
        username: username,
        role: 'admin',
        esxiUser: esxiUsername
      },
      mode: DEMO_MODE ? 'DEMO' : (esxiResult.sessionId.startsWith('demo') || esxiResult.sessionId.startsWith('fallback') ? 'FALLBACK' : 'PRODUCTION')
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
    message: 'Hybrid VMware ESXi API Server is running',
    esxiHost: ESXI_HOST,
    sessionActive: !!sessionId,
    sessionUser: sessionUser,
    mode: DEMO_MODE ? 'DEMO' : (sessionId && (sessionId.startsWith('demo') || sessionId.startsWith('fallback')) ? 'FALLBACK' : 'PRODUCTION'),
    demoMode: DEMO_MODE
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
  console.log(`🚀 Hybrid VMware ESXi API Server running on port ${PORT}`);
  console.log(`🌐 ESXi Host: ${ESXI_HOST}`);
  console.log(`🔐 Admin credentials: admin / admin123`);
  console.log(`🎭 Demo Mode: ${DEMO_MODE ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔄 Auto Fallback: ENABLED (falls back to demo if ESXi fails)`);
  console.log(`⚡ Mode: HYBRID - Smart ESXi/Demo switching`);
});
