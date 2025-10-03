const axios = require('axios');
require('dotenv').config();

const ESXI_HOST = process.env.ESXI_HOST || 'https://192.168.159.128';
const ESXI_USERNAME = 'root';
const ESXI_PASSWORD = '25836926Hy@';
const BACKEND_URL = 'http://localhost:5000';

class ServicesAPITester {
  constructor() {
    this.authToken = null;
    this.api = axios.create({
      baseURL: BACKEND_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async login() {
    try {
      console.log('🔐 Logging in to backend...');
      
      const response = await this.api.post('/api/auth/login', {
        username: 'admin',
        password: 'admin123',
        esxiUsername: ESXI_USERNAME,
        esxiPassword: ESXI_PASSWORD
      });

      if (response.data.success) {
        this.authToken = response.data.token;
        this.api.defaults.headers['Authorization'] = `Bearer ${this.authToken}`;
        console.log('✅ Backend login successful');
        return true;
      } else {
        console.log('❌ Backend login failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Backend login error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testServicesAPI() {
    console.log('\n🧪 Testing Services API...');
    
    try {
      const response = await this.api.get('/api/host/services');
      
      if (response.data.success) {
        console.log('✅ Services API successful');
        console.log(`📊 Found ${response.data.count} services`);
        console.log(`🔗 Endpoint used: ${response.data.endpoint}`);
        
        if (response.data.services && response.data.services.length > 0) {
          console.log('\n📋 Services list:');
          response.data.services.forEach((service, index) => {
            console.log(`  ${index + 1}. ${service.name} (${service.key}) - ${service.state}`);
          });
        }
      } else {
        console.log('❌ Services API failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Services API error:', error.response?.data?.message || error.message);
    }
  }

  async testHostInfoAPI() {
    console.log('\n🧪 Testing Host Info API...');
    
    try {
      const response = await this.api.get('/api/host/info');
      
      if (response.data.success) {
        console.log('✅ Host Info API successful');
        console.log(`📊 Found ${response.data.count} hosts`);
        
        if (response.data.hosts && response.data.hosts.length > 0) {
          console.log('\n📋 Host information:');
          response.data.hosts.forEach((host, index) => {
            console.log(`  ${index + 1}. ${host.name} - ${host.connection_state}`);
            console.log(`     Power State: ${host.power_state}`);
            console.log(`     Boot Time: ${host.boot_time || 'N/A'}`);
          });
        }
      } else {
        console.log('❌ Host Info API failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Host Info API error:', error.response?.data?.message || error.message);
    }
  }

  async testStorageAPI() {
    console.log('\n🧪 Testing Storage API...');
    
    try {
      const response = await this.api.get('/api/host/storage');
      
      if (response.data.success) {
        console.log('✅ Storage API successful');
        console.log(`📊 Found ${response.data.count} datastores`);
        
        if (response.data.datastores && response.data.datastores.length > 0) {
          console.log('\n📋 Storage information:');
          response.data.datastores.forEach((ds, index) => {
            console.log(`  ${index + 1}. ${ds.name} (${ds.type})`);
            console.log(`     Capacity: ${(ds.capacity / (1024**3)).toFixed(2)} GB`);
            console.log(`     Free Space: ${(ds.free_space / (1024**3)).toFixed(2)} GB`);
            console.log(`     Utilization: ${ds.utilization_percent}%`);
          });
        }
      } else {
        console.log('❌ Storage API failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Storage API error:', error.response?.data?.message || error.message);
    }
  }

  async testNetworkingAPI() {
    console.log('\n🧪 Testing Networking API...');
    
    try {
      const response = await this.api.get('/api/host/networking');
      
      if (response.data.success) {
        console.log('✅ Networking API successful');
        console.log(`📊 Found ${response.data.count} networks`);
        
        if (response.data.networks && response.data.networks.length > 0) {
          console.log('\n📋 Network information:');
          response.data.networks.forEach((network, index) => {
            console.log(`  ${index + 1}. ${network.name} (${network.type})`);
            console.log(`     Accessible: ${network.accessible}`);
          });
        }
      } else {
        console.log('❌ Networking API failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Networking API error:', error.response?.data?.message || error.message);
    }
  }

  async testHostStatusAPI() {
    console.log('\n🧪 Testing Host Status API...');
    
    try {
      const response = await this.api.get('/api/host/status');
      
      if (response.data.success) {
        console.log('✅ Host Status API successful');
        console.log(`📊 Status: ${response.data.status}`);
        console.log(`🔗 ESXi Host: ${response.data.sessionInfo.esxiHost}`);
        console.log(`👤 Username: ${response.data.sessionInfo.username}`);
        console.log(`🔑 Session ID: ${response.data.sessionInfo.sessionId ? 'Active' : 'None'}`);
      } else {
        console.log('❌ Host Status API failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Host Status API error:', error.response?.data?.message || error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 ESXi Services API Testing');
    console.log('============================');
    console.log(`ESXi Host: ${ESXI_HOST}`);
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log('');

    // Login first
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    // Test all APIs
    await this.testHostStatusAPI();
    await this.testServicesAPI();
    await this.testHostInfoAPI();
    await this.testStorageAPI();
    await this.testNetworkingAPI();

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Available API Endpoints:');
    console.log('  GET /api/host/status     - ESXi connection status');
    console.log('  GET /api/host/services   - ESXi services information');
    console.log('  GET /api/host/info       - ESXi host information');
    console.log('  GET /api/host/storage    - ESXi storage information');
    console.log('  GET /api/host/networking - ESXi networking information');
  }
}

// Run tests
const tester = new ServicesAPITester();
tester.runAllTests().catch(console.error);
