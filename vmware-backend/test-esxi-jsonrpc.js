const axios = require('axios');
const https = require('https');

// ESXi Configuration
const ESXI_HOST = 'https://192.168.159.128';
const ESXI_USERNAME = 'root';
const ESXI_PASSWORD = '25836926Hy@';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class ESXiJSONRPCTester {
  constructor() {
    this.sessionId = null;
    this.baseURL = ESXI_HOST;
  }

  // JSON-RPC Request helper
  async makeJSONRPCRequest(method, params = {}) {
    const payload = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Date.now()
    };

    try {
      const response = await axios.post(`${this.baseURL}/api/session`, payload, {
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

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }
  }

  // Test authentication với JSON-RPC
  async testAuthentication() {
    console.log('🔐 Testing ESXi JSON-RPC Authentication...');
    console.log(`Host: ${this.baseURL}`);
    console.log(`User: ${ESXI_USERNAME}`);
    console.log('');

    // Test login với JSON-RPC
    const loginPayload = {
      jsonrpc: '2.0',
      method: 'login',
      params: {
        username: ESXI_USERNAME,
        password: ESXI_PASSWORD
      },
      id: 1
    };

    try {
      const response = await axios.post(`${this.baseURL}/api/session`, loginPayload, {
        httpsAgent,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('✅ JSON-RPC Login successful');
      console.log('Response:', response.data);
      
      if (response.data && response.data.result) {
        this.sessionId = response.data.result;
        console.log(`Session ID: ${this.sessionId}`);
        return true;
      }
    } catch (error) {
      console.log('❌ JSON-RPC Login failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
    }

    return false;
  }

  // Test với session ID
  async testWithSession() {
    if (!this.sessionId) {
      console.log('❌ No session ID available');
      return;
    }

    console.log(`\n🧪 Testing API calls with session...`);

    // Test các method khác nhau
    const methods = [
      'getVMs',
      'getHostInfo',
      'getDatastores',
      'getNetworks',
      'getServices'
    ];

    for (const method of methods) {
      console.log(`\nTesting method: ${method}`);
      try {
        const payload = {
          jsonrpc: '2.0',
          method: method,
          params: {},
          id: Date.now()
        };

        const response = await axios.post(`${this.baseURL}/api/session`, payload, {
          headers: {
            'vmware-api-session-id': this.sessionId,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          httpsAgent,
          timeout: 10000
        });

        console.log(`✅ Success with ${method}`);
        console.log('Data:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log(`❌ Failed with ${method}`);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
      }
    }
  }

  // Test ESXi Host Client API trực tiếp
  async testESXiHostClientDirect() {
    console.log('\n🖥️  Testing ESXi Host Client Direct API...');
    
    // Test các endpoint trực tiếp từ ESXi Host Client
    const endpoints = [
      {
        name: 'Get VMs',
        url: '/api/vms',
        method: 'GET'
      },
      {
        name: 'Get Host Info',
        url: '/api/host',
        method: 'GET'
      },
      {
        name: 'Get Storage',
        url: '/api/storage',
        method: 'GET'
      },
      {
        name: 'Get Networking',
        url: '/api/networking',
        method: 'GET'
      },
      {
        name: 'Get Services',
        url: '/api/services',
        method: 'GET'
      }
    ];

    for (const endpoint of endpoints) {
      console.log(`\nTesting: ${endpoint.name}`);
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${this.baseURL}${endpoint.url}`,
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

        console.log(`✅ Success with ${endpoint.name}`);
        console.log('Data:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log(`❌ Failed with ${endpoint.name}`);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
      }
    }
  }

  // Test với curl command thực tế
  async testCurlCommands() {
    console.log('\n🔧 Testing curl equivalent commands...');
    
    const curlCommands = [
      {
        name: 'Get VMs',
        command: `curl -k -u ${ESXI_USERNAME}:${ESXI_PASSWORD} ${this.baseURL}/api/vms`
      },
      {
        name: 'Get Host Info',
        command: `curl -k -u ${ESXI_USERNAME}:${ESXI_PASSWORD} ${this.baseURL}/api/host`
      },
      {
        name: 'Get Storage',
        command: `curl -k -u ${ESXI_USERNAME}:${ESXI_PASSWORD} ${this.baseURL}/api/storage`
      }
    ];

    console.log('📋 Curl commands to test manually:');
    curlCommands.forEach((cmd, i) => {
      console.log(`  ${i + 1}. ${cmd.name}:`);
      console.log(`     ${cmd.command}`);
    });

    console.log('\n💡 Try running these commands in your terminal to test ESXi API directly.');
  }

  // Test với different authentication methods
  async testDifferentAuthMethods() {
    console.log('\n🔐 Testing different authentication methods...');
    
    const authMethods = [
      {
        name: 'Basic Auth with GET',
        method: 'GET',
        url: '/api/vms',
        auth: { username: ESXI_USERNAME, password: ESXI_PASSWORD }
      },
      {
        name: 'Basic Auth with POST',
        method: 'POST',
        url: '/api/vms',
        auth: { username: ESXI_USERNAME, password: ESXI_PASSWORD }
      },
      {
        name: 'Session-based Auth',
        method: 'GET',
        url: '/api/vms',
        headers: { 'vmware-api-session-id': this.sessionId }
      }
    ];

    for (const authMethod of authMethods) {
      console.log(`\nTesting: ${authMethod.name}`);
      try {
        const config = {
          method: authMethod.method,
          url: `${this.baseURL}${authMethod.url}`,
          httpsAgent,
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        };

        if (authMethod.auth) {
          config.auth = authMethod.auth;
        }
        if (authMethod.headers) {
          config.headers = { ...config.headers, ...authMethod.headers };
        }

        const response = await axios(config);
        console.log(`✅ Success with ${authMethod.name}`);
        console.log('Data:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log(`❌ Failed with ${authMethod.name}`);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
      }
    }
  }

  // Chạy tất cả tests
  async runAllTests() {
    console.log('🚀 ESXi JSON-RPC API Testing');
    console.log('=============================');
    console.log('');

    // Test 1: Authentication
    const authSuccess = await this.testAuthentication();
    
    if (authSuccess) {
      // Test 2: API calls với session
      await this.testWithSession();
    }

    // Test 3: ESXi Host Client Direct API
    await this.testESXiHostClientDirect();

    // Test 4: Different authentication methods
    await this.testDifferentAuthMethods();

    // Test 5: Curl commands
    await this.testCurlCommands();

    console.log('\n🎉 All tests completed!');
    console.log('\n📝 Summary:');
    console.log('- ESXi host is accessible');
    console.log('- Authentication methods tested');
    console.log('- Check the curl commands above for manual testing');
  }
}

// Chạy test
async function main() {
  const tester = new ESXiJSONRPCTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ESXiJSONRPCTester;
