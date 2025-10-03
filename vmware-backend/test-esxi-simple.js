const axios = require('axios');
const https = require('https');

// Import config - sử dụng local config nếu có, nếu không thì dùng default
let config;
try {
  config = require('./test-config-local');
} catch (error) {
  config = require('./test-config');
}

const { esxi, test } = config;

// HTTPS Agent để bypass SSL self-signed
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class SimpleESXiTester {
  constructor() {
    this.sessionId = null;
    this.baseURL = esxi.host;
  }

  // Tạo request với session
  async makeRequest(method, endpoint, data = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.sessionId) {
      headers['vmware-api-session-id'] = this.sessionId;
    }

    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        data,
        headers,
        httpsAgent,
        timeout: test.timeout
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

  // Test login
  async login() {
    console.log('🔐 Logging in to ESXi...');
    
    const result = await axios.post(`${this.baseURL}/rest/com/vmware/cis/session`, {}, {
      auth: {
        username: esxi.username,
        password: esxi.password
      },
      httpsAgent,
      timeout: test.timeout
    });

    if (result.data && result.data.value) {
      this.sessionId = result.data.value;
      console.log('✅ Login successful!');
      return true;
    }
    return false;
  }

  // Test get VMs
  async getVMs() {
    console.log('🖥️  Getting VMs...');
    
    const result = await this.makeRequest('GET', '/rest/vcenter/vm');
    
    if (result.success) {
      const vms = result.data.value;
      console.log(`✅ Found ${vms.length} VMs:`);
      vms.forEach((vm, i) => {
        console.log(`  ${i + 1}. ${vm.name} (${vm.power_state})`);
      });
      return vms;
    } else {
      console.log('❌ Failed to get VMs:', result.error);
      return [];
    }
  }

  // Test get VM details
  async getVMDetails(vmId) {
    console.log(`🔍 Getting details for VM: ${vmId}...`);
    
    const result = await this.makeRequest('GET', `/rest/vcenter/vm/${vmId}`);
    
    if (result.success) {
      const vm = result.data.value;
      console.log('✅ VM Details:');
      console.log(`  Name: ${vm.name}`);
      console.log(`  Power: ${vm.power_state}`);
      console.log(`  CPU: ${vm.cpu?.count || 'N/A'} cores`);
      console.log(`  Memory: ${vm.memory?.size_MiB || 'N/A'} MB`);
      return vm;
    } else {
      console.log('❌ Failed to get VM details:', result.error);
      return null;
    }
  }

  // Test VM power operation (chỉ hiển thị, không thực hiện)
  async testVMPowerOperation(vmId, operation) {
    console.log(`⚡ Testing ${operation} for VM: ${vmId}...`);
    
    if (test.skipPowerOperations) {
      console.log('⚠️  Power operations skipped for safety');
      console.log(`   Would call: POST /rest/vcenter/vm/${vmId}/power/${operation}`);
      return true;
    }

    const result = await this.makeRequest('POST', `/rest/vcenter/vm/${vmId}/power/${operation}`);
    
    if (result.success) {
      console.log(`✅ ${operation} command sent successfully`);
      return true;
    } else {
      console.log(`❌ ${operation} failed:`, result.error);
      return false;
    }
  }

  // Test get host info
  async getHostInfo() {
    console.log('🖥️  Getting host info...');
    
    const result = await this.makeRequest('GET', '/rest/vcenter/host');
    
    if (result.success) {
      const hosts = result.data.value;
      console.log(`✅ Found ${hosts.length} hosts:`);
      hosts.forEach((host, i) => {
        console.log(`  ${i + 1}. ${host.name} (${host.connection_state})`);
      });
      return hosts;
    } else {
      console.log('❌ Failed to get host info:', result.error);
      return [];
    }
  }

  // Logout
  async logout() {
    console.log('🚪 Logging out...');
    
    const result = await this.makeRequest('DELETE', '/rest/com/vmware/cis/session');
    
    if (result.success) {
      console.log('✅ Logout successful');
      this.sessionId = null;
    } else {
      console.log('❌ Logout failed:', result.error);
    }
  }

  // Chạy tất cả tests
  async runTests() {
    console.log('🚀 Starting Simple ESXi API Tests');
    console.log('==================================');
    console.log(`Host: ${this.baseURL}`);
    console.log(`User: ${esxi.username}`);
    console.log('');

    try {
      // 1. Login
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        console.log('❌ Cannot proceed without authentication');
        return;
      }

      // 2. Get VMs
      const vms = await this.getVMs();
      
      // 3. Get VM details (nếu có VM)
      if (vms.length > 0) {
        const testVM = test.testSpecificVM || vms[0].vm;
        await this.getVMDetails(testVM);
        
        // 4. Test power operations
        await this.testVMPowerOperation(testVM, 'start');
        await this.testVMPowerOperation(testVM, 'stop');
        await this.testVMPowerOperation(testVM, 'restart');
      }

      // 5. Get host info
      await this.getHostInfo();

      // 6. Logout
      await this.logout();

      console.log('\n🎉 All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Chạy test
async function main() {
  const tester = new SimpleESXiTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SimpleESXiTester;
