const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    esxi_host: process.env.ESXI_HOST
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password, esxiUsername, esxiPassword } = req.body;
  
  // Simple mock authentication
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      token: 'mock-jwt-token-12345',
      user: {
        id: '1',
        username: 'admin',
        role: 'admin'
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/host/services', (req, res) => {
  // Mock services data
  res.json({
    success: true,
    services: [
      {
        key: 'vpxa',
        name: 'VMware vCenter Agent',
        state: 'running',
        startup_type: 'automatic',
        description: 'VMware vCenter Agent service',
        health: 'healthy'
      },
      {
        key: 'hostd',
        name: 'VMware Host Agent',
        state: 'running',
        startup_type: 'automatic',
        description: 'VMware Host Agent service',
        health: 'healthy'
      },
      {
        key: 'vmtoolsd',
        name: 'VMware Tools',
        state: 'running',
        startup_type: 'automatic',
        description: 'VMware Tools service',
        health: 'healthy'
      }
    ],
    count: 3,
    endpoint: '/rest/vcenter/host/services',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/host/info', (req, res) => {
  // Mock host data
  res.json({
    success: true,
    hosts: [
      {
        host: 'host-1',
        name: 'ESXi-192.168.159.128',
        connection_state: 'CONNECTED',
        power_state: 'POWERED_ON',
        boot_time: '2025-01-10T10:30:00Z',
        hardware: {
          cpu_model: 'Intel Xeon E5-2620',
          cpu_cores: 8,
          memory_total: 32768
        },
        cpu: {
          count: 8,
          cores_per_socket: 4
        },
        memory: {
          size_MiB: 32768
        }
      }
    ],
    count: 1,
    message: 'Host information retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/host/storage', (req, res) => {
  // Mock storage data
  res.json({
    success: true,
    datastores: [
      {
        datastore: 'datastore-1',
        name: 'datastore1',
        type: 'VMFS',
        accessible: true,
        capacity: 1073741824000, // 1TB
        free_space: 536870912000, // 500GB
        used_space: 536870912000,
        utilization_percent: '50.00'
      }
    ],
    count: 1,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/host/networking', (req, res) => {
  // Mock networking data
  res.json({
    success: true,
    networks: [
      {
        network: 'network-1',
        name: 'VM Network',
        type: 'STANDARD_PORTGROUP',
        accessible: true
      }
    ],
    count: 1,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/host/status', (req, res) => {
  res.json({
    success: true,
    status: 'connected',
    sessionInfo: {
      authenticated: true,
      sessionId: 'mock-session-12345',
      username: 'root',
      esxiHost: 'https://192.168.159.128'
    },
    timestamp: new Date().toISOString()
  });
});

// VMs API endpoints
app.get('/api/vms', (req, res) => {
  // Mock VMs data
  res.json({
    success: true,
    vms: [
      {
        id: 'vm-1',
        name: 'Windows Server 2019',
        power_state: 'POWERED_ON',
        cpu_count: 2,
        memory_size_mb: 4096,
        guest_os: 'Windows Server 2019',
        hardware_version: 'vmx-15',
        boot_time: '2025-01-10T10:30:00Z',
        uptime_seconds: 3600
      },
      {
        id: 'vm-2',
        name: 'Ubuntu Server 20.04',
        power_state: 'POWERED_ON',
        cpu_count: 1,
        memory_size_mb: 2048,
        guest_os: 'Ubuntu Linux (64-bit)',
        hardware_version: 'vmx-15',
        boot_time: '2025-01-10T11:00:00Z',
        uptime_seconds: 1800
      },
      {
        id: 'vm-3',
        name: 'CentOS 8',
        power_state: 'POWERED_OFF',
        cpu_count: 1,
        memory_size_mb: 1024,
        guest_os: 'CentOS 8 (64-bit)',
        hardware_version: 'vmx-15',
        boot_time: null,
        uptime_seconds: 0
      }
    ],
    count: 3,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/vms/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock VM details
  const vmDetails = {
    'vm-1': {
      id: 'vm-1',
      name: 'Windows Server 2019',
      power_state: 'POWERED_ON',
      cpu_count: 2,
      memory_size_mb: 4096,
      guest_os: 'Windows Server 2019',
      hardware_version: 'vmx-15',
      boot_time: '2025-01-10T10:30:00Z',
      uptime_seconds: 3600,
      ip_address: '192.168.1.100',
      tools_status: 'toolsOk',
      tools_version: '11.3.0'
    },
    'vm-2': {
      id: 'vm-2',
      name: 'Ubuntu Server 20.04',
      power_state: 'POWERED_ON',
      cpu_count: 1,
      memory_size_mb: 2048,
      guest_os: 'Ubuntu Linux (64-bit)',
      hardware_version: 'vmx-15',
      boot_time: '2025-01-10T11:00:00Z',
      uptime_seconds: 1800,
      ip_address: '192.168.1.101',
      tools_status: 'toolsOk',
      tools_version: '11.3.0'
    },
    'vm-3': {
      id: 'vm-3',
      name: 'CentOS 8',
      power_state: 'POWERED_OFF',
      cpu_count: 1,
      memory_size_mb: 1024,
      guest_os: 'CentOS 8 (64-bit)',
      hardware_version: 'vmx-15',
      boot_time: null,
      uptime_seconds: 0,
      ip_address: null,
      tools_status: 'toolsNotInstalled',
      tools_version: null
    }
  };
  
  const vm = vmDetails[id];
  if (vm) {
    res.json({
      success: true,
      vm: vm,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'VM not found'
    });
  }
});

app.post('/api/vms/:id/start', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'VM start command sent successfully',
    vmId: id,
    vmName: `VM-${id}`,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/vms/:id/stop', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'VM stop command sent successfully',
    vmId: id,
    vmName: `VM-${id}`,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/vms/:id/restart', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'VM restart command sent successfully',
    vmId: id,
    vmName: `VM-${id}`,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple Test Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 ESXi Host: ${process.env.ESXI_HOST}`);
  console.log(`🔗 CORS enabled for: http://localhost:3000, http://localhost:3001`);
});
