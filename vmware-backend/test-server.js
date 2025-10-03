const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 5001; // Sử dụng port khác để tránh conflict

// Middleware
app.use(cors());
app.use(express.json());

// ESXi Configuration
const ESXI_HOST = 'https://192.168.159.128';
const ESXI_USERNAME = 'root';
const ESXI_PASSWORD = '25836926Hy@';

// HTTPS Agent để bypass SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Test ESXi connection
async function testESXiConnection() {
  console.log('🔍 Testing ESXi connection...');
  
  try {
    // Test 1: Basic connection
    const response = await axios.get(`${ESXI_HOST}/ui/`, {
      httpsAgent,
      timeout: 10000,
      auth: {
        username: ESXI_USERNAME,
        password: ESXI_PASSWORD
      }
    });
    
    console.log('✅ ESXi connection successful');
    console.log('Status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ ESXi connection failed');
    console.log('Error:', error.message);
    return false;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'VMware ESXi Test Server',
    timestamp: new Date().toISOString(),
    esxi_host: ESXI_HOST
  });
});

app.post('/api/test-login', async (req, res) => {
  try {
    console.log('🔐 Testing ESXi login...');
    
    // Test với endpoint khác nhau
    const endpoints = [
      '/api/session',
      '/rest/com/vmware/cis/session',
      '/api/vms',
      '/ui/api/session'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        
        const response = await axios.post(`${ESXI_HOST}${endpoint}`, {}, {
          auth: {
            username: ESXI_USERNAME,
            password: ESXI_PASSWORD
          },
          httpsAgent,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        results.push({
          endpoint,
          success: true,
          status: response.status,
          data: response.data
        });
        
        console.log(`✅ ${endpoint} - Success`);
      } catch (error) {
        results.push({
          endpoint,
          success: false,
          status: error.response?.status,
          error: error.response?.data || error.message
        });
        
        console.log(`❌ ${endpoint} - Failed: ${error.response?.status}`);
      }
    }
    
    res.json({
      success: true,
      message: 'ESXi API test completed',
      results
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

app.get('/api/test-ui', async (req, res) => {
  try {
    console.log('🖥️ Testing ESXi UI access...');
    
    const response = await axios.get(`${ESXI_HOST}/ui/`, {
      auth: {
        username: ESXI_USERNAME,
        password: ESXI_PASSWORD
      },
      httpsAgent,
      timeout: 10000
    });
    
    res.json({
      success: true,
      message: 'ESXi UI accessible',
      status: response.status,
      content_length: response.data.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ESXi UI test failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 VMware ESXi Test Server running on port ${PORT}`);
  console.log(`🌐 ESXi Host: ${ESXI_HOST}`);
  console.log(`📝 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/test-login`);
  console.log(`   GET  http://localhost:${PORT}/api/test-ui`);
  console.log('');
  
  // Test ESXi connection on startup
  await testESXiConnection();
});

module.exports = app;
