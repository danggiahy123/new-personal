const axios = require('axios');
const https = require('https');

// ESXi Configuration
const ESXI_HOST = 'https://192.168.159.128';
const ESXI_USERNAME = 'root';
const ESXI_PASSWORD = '25836926Hy@';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class ESXiCorrectTester {
  constructor() {
    this.sessionId = null;
    this.baseURL = ESXI_HOST;
  }

  // Test authentication với các endpoint khác nhau
  async testAuthentication() {
    console.log('🔐 Testing ESXi Authentication...');
    console.log(`Host: ${this.baseURL}`);
    console.log(`User: ${ESXI_USERNAME}`);
    console.log('');

    const endpoints = [
      '/rest/com/vmware/cis/session',
      '/api/session',
      '/rest/vcenter/session',
      '/api/vcenter/session'
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing endpoint: ${endpoint}`);
      try {
        const response = await axios.post(`${this.baseURL}${endpoint}`, {}, {
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

        console.log(`✅ Success with ${endpoint}`);
        console.log('Response:', response.data);
        
        if (response.data && response.data.value) {
          this.sessionId = response.data.value;
          console.log(`Session ID: ${this.sessionId}`);
          return endpoint;
        }
      } catch (error) {
        console.log(`❌ Failed with ${endpoint}`);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
      }
      console.log('');
    }

    return null;
  }

  // Test với session ID
  async testWithSession(sessionEndpoint) {
    if (!this.sessionId) {
      console.log('❌ No session ID available');
      return;
    }

    console.log(`\n🧪 Testing API calls with session from ${sessionEndpoint}...`);

    // Test các endpoint khác nhau
    const testEndpoints = [
      '/rest/vcenter/vm',
      '/api/vcenter/vm',
      '/rest/vcenter/host',
      '/api/vcenter/host',
      '/rest/vcenter/datastore',
      '/api/vcenter/datastore'
    ];

    for (const endpoint of testEndpoints) {
      console.log(`\nTesting: ${endpoint}`);
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          headers: {
            'vmware-api-session-id': this.sessionId,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          httpsAgent,
          timeout: 10000
        });

        console.log(`✅ Success with ${endpoint}`);
        console.log('Data:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log(`❌ Failed with ${endpoint}`);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
      }
    }
  }

  // Test ESXi Host Client API (UI API)
  async testESXiHostClientAPI() {
    console.log('\n🖥️  Testing ESXi Host Client API...');
    
    // ESXi Host Client sử dụng API khác
    const endpoints = [
      '/api/vms',
      '/api/host',
      '/api/storage',
      '/api/networking'
    ];

    for (const endpoint of endpoints) {
      console.log(`\nTesting: ${endpoint}`);
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          auth: {
            username: ESXI_USERNAME,
            password: ESXI_PASSWORD
          },
          httpsAgent,
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        });

        console.log(`✅ Success with ${endpoint}`);
        console.log('Data:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log(`❌ Failed with ${endpoint}`);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
      }
    }
  }

  // Test với curl command
  async testCurlEquivalent() {
    console.log('\n🔧 Testing curl equivalent commands...');
    
    const commands = [
      {
        name: 'Get VMs',
        url: `${this.baseURL}/api/vms`,
        method: 'GET'
      },
      {
        name: 'Get Host Info',
        url: `${this.baseURL}/api/host`,
        method: 'GET'
      },
      {
        name: 'Get Storage',
        url: `${this.baseURL}/api/storage`,
        method: 'GET'
      }
    ];

    for (const cmd of commands) {
      console.log(`\nTesting: ${cmd.name}`);
      try {
        const response = await axios({
          method: cmd.method,
          url: cmd.url,
          auth: {
            username: ESXI_USERNAME,
            password: ESXI_PASSWORD
          },
          httpsAgent,
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        });

        console.log(`✅ Success with ${cmd.name}`);
        console.log('Data:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log(`❌ Failed with ${cmd.name}`);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
      }
    }
  }

  // Chạy tất cả tests
  async runAllTests() {
    console.log('🚀 ESXi API Testing - Correct Version');
    console.log('=====================================');
    console.log('');

    // Test 1: Authentication
    const sessionEndpoint = await this.testAuthentication();
    
    if (sessionEndpoint) {
      // Test 2: API calls với session
      await this.testWithSession(sessionEndpoint);
    }

    // Test 3: ESXi Host Client API
    await this.testESXiHostClientAPI();

    // Test 4: Curl equivalent
    await this.testCurlEquivalent();

    console.log('\n🎉 All tests completed!');
  }
}

// Chạy test
async function main() {
  const tester = new ESXiCorrectTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ESXiCorrectTester;
