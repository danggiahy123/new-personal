const axios = require('axios');
const https = require('https');

// ESXi Configuration
const ESXI_HOST = 'https://192.168.159.128';
const ESXI_USERNAME = 'root';
const ESXI_PASSWORD = '25836926Hy@';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class ESXiFinalTester {
  constructor() {
    this.sessionId = null;
    this.baseURL = ESXI_HOST;
  }

  // Test ESXi Host Client API với cách tiếp cận đúng
  async testESXiHostClientAPI() {
    console.log('🖥️  Testing ESXi Host Client API...');
    console.log(`Host: ${this.baseURL}`);
    console.log(`User: ${ESXI_USERNAME}`);
    console.log('');

    // ESXi Host Client sử dụng API endpoints khác
    const endpoints = [
      {
        name: 'Get VMs',
        url: '/api/vms',
        method: 'GET',
        description: 'Lấy danh sách Virtual Machines'
      },
      {
        name: 'Get Host Info',
        url: '/api/host',
        method: 'GET',
        description: 'Lấy thông tin Host'
      },
      {
        name: 'Get Storage',
        url: '/api/storage',
        method: 'GET',
        description: 'Lấy thông tin Storage'
      },
      {
        name: 'Get Networking',
        url: '/api/networking',
        method: 'GET',
        description: 'Lấy thông tin Networking'
      },
      {
        name: 'Get Services',
        url: '/api/services',
        method: 'GET',
        description: 'Lấy danh sách Services'
      },
      {
        name: 'Get Tasks',
        url: '/api/tasks',
        method: 'GET',
        description: 'Lấy danh sách Tasks'
      }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🧪 Testing: ${endpoint.name}`);
      console.log(`   Description: ${endpoint.description}`);
      console.log(`   Endpoint: ${endpoint.method} ${endpoint.url}`);
      
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${this.baseURL}${endpoint.url}`,
          auth: {
            username: ESXI_USERNAME,
            password: ESXI_PASSWORD
          },
          httpsAgent,
          timeout: 15000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log(`   ✅ Success!`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data:`, JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log(`   ❌ Failed`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data || error.message}`);
      }
    }
  }

  // Test với curl commands thực tế
  async testCurlCommands() {
    console.log('\n🔧 Curl Commands for Manual Testing...');
    console.log('=====================================');
    
    const curlCommands = [
      {
        name: 'Get VMs',
        command: `curl -k -u ${ESXI_USERNAME}:${ESXI_PASSWORD} ${this.baseURL}/api/vms`,
        description: 'Lấy danh sách Virtual Machines'
      },
      {
        name: 'Get Host Info',
        command: `curl -k -u ${ESXI_USERNAME}:${ESXI_PASSWORD} ${this.baseURL}/api/host`,
        description: 'Lấy thông tin Host'
      },
      {
        name: 'Get Storage',
        command: `curl -k -u ${ESXI_USERNAME}:${ESXI_PASSWORD} ${this.baseURL}/api/storage`,
        description: 'Lấy thông tin Storage'
      },
      {
        name: 'Get Networking',
        command: `curl -k -u ${ESXI_USERNAME}:${ESXI_PASSWORD} ${this.baseURL}/api/networking`,
        description: 'Lấy thông tin Networking'
      },
      {
        name: 'Get Services',
        command: `curl -k -u ${ESXI_USERNAME}:${ESXI_PASSWORD} ${this.baseURL}/api/services`,
        description: 'Lấy danh sách Services'
      }
    ];

    console.log('📋 Copy và paste các lệnh curl này vào terminal để test:');
    console.log('');
    
    curlCommands.forEach((cmd, i) => {
      console.log(`${i + 1}. ${cmd.name}:`);
      console.log(`   ${cmd.command}`);
      console.log(`   # ${cmd.description}`);
      console.log('');
    });
  }

  // Test với PowerShell commands (cho Windows)
  async testPowerShellCommands() {
    console.log('\n💻 PowerShell Commands for Windows...');
    console.log('=====================================');
    
    const psCommands = [
      {
        name: 'Get VMs',
        command: `Invoke-RestMethod -Uri "${this.baseURL}/api/vms" -Method Get -Credential (Get-Credential) -SkipCertificateCheck`,
        description: 'Lấy danh sách Virtual Machines'
      },
      {
        name: 'Get Host Info',
        command: `Invoke-RestMethod -Uri "${this.baseURL}/api/host" -Method Get -Credential (Get-Credential) -SkipCertificateCheck`,
        description: 'Lấy thông tin Host'
      }
    ];

    console.log('📋 PowerShell commands (chạy trong PowerShell):');
    console.log('');
    
    psCommands.forEach((cmd, i) => {
      console.log(`${i + 1}. ${cmd.name}:`);
      console.log(`   ${cmd.command}`);
      console.log(`   # ${cmd.description}`);
      console.log('');
    });
  }

  // Test với different content types
  async testDifferentContentTypes() {
    console.log('\n🔍 Testing Different Content Types...');
    console.log('=====================================');
    
    const contentTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'text/plain',
      'application/xml'
    ];

    for (const contentType of contentTypes) {
      console.log(`\nTesting with Content-Type: ${contentType}`);
      
      try {
        const response = await axios.post(`${this.baseURL}/api/session`, {}, {
          auth: {
            username: ESXI_USERNAME,
            password: ESXI_PASSWORD
          },
          httpsAgent,
          timeout: 10000,
          headers: {
            'Content-Type': contentType,
            'Accept': 'application/json'
          }
        });

        console.log(`✅ Success with ${contentType}`);
        console.log('Response:', response.data);
      } catch (error) {
        console.log(`❌ Failed with ${contentType}`);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
      }
    }
  }

  // Tạo file test script
  async createTestScript() {
    console.log('\n📝 Creating Test Script...');
    
    const testScript = `#!/bin/bash
# ESXi API Test Script
# Generated automatically

ESXI_HOST="https://192.168.159.128"
ESXI_USER="root"
ESXI_PASS="25836926Hy@"

echo "🚀 Testing ESXi API with curl..."
echo "Host: $ESXI_HOST"
echo "User: $ESXI_USER"
echo ""

# Test 1: Get VMs
echo "1️⃣ Testing Get VMs..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/vms
echo ""

# Test 2: Get Host Info
echo "2️⃣ Testing Get Host Info..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/host
echo ""

# Test 3: Get Storage
echo "3️⃣ Testing Get Storage..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/storage
echo ""

# Test 4: Get Networking
echo "4️⃣ Testing Get Networking..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/networking
echo ""

# Test 5: Get Services
echo "5️⃣ Testing Get Services..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/services
echo ""

echo "🎉 All tests completed!"
`;

    const fs = require('fs');
    fs.writeFileSync('test-esxi-curl.sh', testScript);
    console.log('✅ Created test-esxi-curl.sh');
    console.log('   Run with: bash test-esxi-curl.sh');
  }

  // Chạy tất cả tests
  async runAllTests() {
    console.log('🚀 ESXi Final API Testing');
    console.log('=========================');
    console.log('');

    // Test 1: ESXi Host Client API
    await this.testESXiHostClientAPI();

    // Test 2: Curl commands
    await this.testCurlCommands();

    // Test 3: PowerShell commands
    await this.testPowerShellCommands();

    // Test 4: Different content types
    await this.testDifferentContentTypes();

    // Test 5: Create test script
    await this.createTestScript();

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Try the curl commands above manually');
    console.log('2. Run the generated test-esxi-curl.sh script');
    console.log('3. Check ESXi Host Client UI for available APIs');
    console.log('4. Use browser dev tools to inspect API calls');
  }
}

// Chạy test
async function main() {
  const tester = new ESXiFinalTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ESXiFinalTester;
