const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock VMs data
const mockVMs = [
  {
    id: "vm-001",
    name: "Ubuntu Server 20.04",
    power_state: "POWERED_ON",
    cpu: 2,
    memory_size: 4294967296 // 4GB
  },
  {
    id: "vm-002", 
    name: "Windows Server 2019",
    power_state: "POWERED_OFF",
    cpu: 4,
    memory_size: 8589934592 // 8GB
  },
  {
    id: "vm-003",
    name: "CentOS 8",
    power_state: "POWERED_ON", 
    cpu: 1,
    memory_size: 2147483648 // 2GB
  }
];

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

    // Mock ESXi authentication success
    res.json({
      success: true,
      message: 'Login successful (Demo Mode)',
      sessionId: 'demo-session-123',
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
    res.json({
      success: true,
      data: mockVMs
    });
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
    const vmId = req.params.id;
    const vm = mockVMs.find(v => v.id === vmId);
    
    if (vm) {
      vm.power_state = "POWERED_ON";
      res.json({
        success: true,
        message: `VM ${vm.name} started successfully (Demo Mode)`
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'VM not found'
      });
    }
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
    const vmId = req.params.id;
    const vm = mockVMs.find(v => v.id === vmId);
    
    if (vm) {
      vm.power_state = "POWERED_OFF";
      res.json({
        success: true,
        message: `VM ${vm.name} stopped successfully (Demo Mode)`
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'VM not found'
      });
    }
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
    const vmId = req.params.id;
    const vm = mockVMs.find(v => v.id === vmId);
    
    if (vm) {
      res.json({
        success: true,
        message: `VM ${vm.name} restarted successfully (Demo Mode)`
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'VM not found'
      });
    }
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
    const vmId = req.params.id;
    const vm = mockVMs.find(v => v.id === vmId);
    
    if (vm) {
      vm.power_state = "SUSPENDED";
      res.json({
        success: true,
        message: `VM ${vm.name} suspended successfully (Demo Mode)`
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'VM not found'
      });
    }
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
    message: 'Demo Server is running',
    mode: 'DEMO',
    vms: mockVMs.length
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Demo VMware ESXi API Server running on port ${PORT}`);
  console.log(`📝 Demo Mode - No real ESXi connection required`);
  console.log(`🔐 Admin credentials: admin / admin123`);
  console.log(`🎯 ESXi credentials: any username/password`);
  console.log(`📊 Mock VMs: ${mockVMs.length} virtual machines`);
});
