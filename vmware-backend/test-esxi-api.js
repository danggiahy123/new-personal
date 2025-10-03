const axios = require('axios');
const https = require('https');

// ESXi Configuration - Thay đổi theo ESXi của bạn
const ESXI_HOST = 'https://192.168.159.128'; // IP của ESXi host
const ESXI_USERNAME = 'root'; // Username ESXi
const ESXI_PASSWORD = 'your-password'; // Password ESXi

// HTTPS Agent để bypass SSL self-signed
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class ESXiAPITester {
  constructor() {
    this.sessionId = null;
    this.baseURL = ESXI_HOST;
  }

  // Test 1: Login và lấy session ID
  async testLogin() {
    console.log('🔐 Testing ESXi Login...');
    console.log(`Host: ${this.baseURL}`);
    console.log(`User: ${ESXI_USERNAME}`);
    
    try {
      const response = await axios.post(`${this.baseURL}/rest/com/vmware/cis/session`, {}, {
        auth: {
          username: ESXI_USERNAME,
          password: ESXI_PASSWORD
        },
        httpsAgent: httpsAgent,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.sessionId = response.data.value;
      console.log('✅ Login successful!');
      console.log(`Session ID: ${this.sessionId}`);
      return true;
    } catch (error) {
      console.error('❌ Login failed:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }

  // Test 2: Lấy danh sách VMs
  async testGetVMs() {
    console.log('\n🖥️  Testing Get VMs...');
    
    if (!this.sessionId) {
      console.error('❌ Not authenticated. Please login first.');
      return false;
    }

    try {
      const response = await axios.get(`${this.baseURL}/rest/vcenter/vm`, {
        headers: {
          'vmware-api-session-id': this.sessionId,
          'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent,
        timeout: 15000
      });

      const vms = response.data.value;
      console.log(`✅ Found ${vms.length} VMs:`);
      
      vms.forEach((vm, index) => {
        console.log(`  ${index + 1}. ${vm.name} (ID: ${vm.vm})`);
        console.log(`     Power State: ${vm.power_state}`);
        console.log(`     CPU: ${vm.cpu?.count || 'N/A'} cores`);
        console.log(`     Memory: ${vm.memory?.size_MiB || 'N/A'} MB`);
        console.log(`     Guest OS: ${vm.guest_OS || 'Unknown'}`);
        console.log('');
      });

      return vms;
    } catch (error) {
      console.error('❌ Failed to get VMs:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }

  // Test 3: Lấy thông tin chi tiết VM
  async testGetVMDetails(vmId) {
    console.log(`\n🔍 Testing Get VM Details for ID: ${vmId}...`);
    
    if (!this.sessionId) {
      console.error('❌ Not authenticated. Please login first.');
      return false;
    }

    try {
      const response = await axios.get(`${this.baseURL}/rest/vcenter/vm/${vmId}`, {
        headers: {
          'vmware-api-session-id': this.sessionId,
          'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent,
        timeout: 15000
      });

      const vm = response.data.value;
      console.log('✅ VM Details:');
      console.log(`  Name: ${vm.name}`);
      console.log(`  Power State: ${vm.power_state}`);
      console.log(`  CPU Count: ${vm.cpu?.count || 'N/A'}`);
      console.log(`  Memory Size: ${vm.memory?.size_MiB || 'N/A'} MB`);
      console.log(`  Guest OS: ${vm.guest_OS || 'Unknown'}`);
      console.log(`  Hardware Version: ${vm.hardware?.version || 'Unknown'}`);
      console.log(`  Boot Time: ${vm.boot_time || 'N/A'}`);
      console.log(`  Uptime: ${vm.uptime_seconds || 0} seconds`);

      return vm;
    } catch (error) {
      console.error('❌ Failed to get VM details:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }

  // Test 4: Test VM Power Operations (chỉ test, không thực hiện)
  async testVMPowerOperations(vmId) {
    console.log(`\n⚡ Testing VM Power Operations for ID: ${vmId}...`);
    
    if (!this.sessionId) {
      console.error('❌ Not authenticated. Please login first.');
      return false;
    }

    // Test các endpoint power operations
    const operations = [
      { name: 'Start VM', endpoint: `/rest/vcenter/vm/${vmId}/power/start`, method: 'POST' },
      { name: 'Stop VM', endpoint: `/rest/vcenter/vm/${vmId}/power/stop`, method: 'POST' },
      { name: 'Restart VM', endpoint: `/rest/vcenter/vm/${vmId}/power/restart`, method: 'POST' },
      { name: 'Suspend VM', endpoint: `/rest/vcenter/vm/${vmId}/power/suspend`, method: 'POST' },
      { name: 'Reset VM', endpoint: `/rest/vcenter/vm/${vmId}/power/reset`, method: 'POST' }
    ];

    console.log('📋 Available Power Operations:');
    operations.forEach((op, index) => {
      console.log(`  ${index + 1}. ${op.name}`);
      console.log(`     Method: ${op.method}`);
      console.log(`     Endpoint: ${op.endpoint}`);
    });

    console.log('\n⚠️  Note: These operations are NOT executed automatically for safety.');
    console.log('   To test them, uncomment the test code below.');

    // Uncomment để test thực sự (CẨN THẬN!)
    /*
    for (const op of operations) {
      try {
        console.log(`\n🧪 Testing ${op.name}...`);
        const response = await axios({
          method: op.method,
          url: `${this.baseURL}${op.endpoint}`,
          headers: {
            'vmware-api-session-id': this.sessionId,
            'Content-Type': 'application/json'
          },
          httpsAgent: httpsAgent,
          timeout: 15000
        });
        console.log(`✅ ${op.name} successful`);
      } catch (error) {
        console.log(`❌ ${op.name} failed:`, error.response?.data || error.message);
      }
    }
    */

    return true;
  }

  // Test 5: Lấy thông tin Host
  async testGetHostInfo() {
    console.log('\n🖥️  Testing Get Host Info...');
    
    if (!this.sessionId) {
      console.error('❌ Not authenticated. Please login first.');
      return false;
    }

    try {
      const response = await axios.get(`${this.baseURL}/rest/vcenter/host`, {
        headers: {
          'vmware-api-session-id': this.sessionId,
          'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent,
        timeout: 15000
      });

      const hosts = response.data.value;
      console.log(`✅ Found ${hosts.length} hosts:`);
      
      hosts.forEach((host, index) => {
        console.log(`  ${index + 1}. ${host.name} (ID: ${host.host})`);
        console.log(`     Connection State: ${host.connection_state}`);
        console.log(`     Power State: ${host.power_state}`);
        console.log(`     CPU Count: ${host.hardware?.cpu?.count || 'N/A'}`);
        console.log(`     Memory Size: ${host.hardware?.memory?.size_MiB || 'N/A'} MB`);
        console.log('');
      });

      return hosts;
    } catch (error) {
      console.error('❌ Failed to get host info:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }

  // Test 6: Logout
  async testLogout() {
    console.log('\n🚪 Testing Logout...');
    
    if (!this.sessionId) {
      console.log('ℹ️  No active session to logout');
      return true;
    }

    try {
      await axios.delete(`${this.baseURL}/rest/com/vmware/cis/session`, {
        headers: {
          'vmware-api-session-id': this.sessionId,
          'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent,
        timeout: 15000
      });

      console.log('✅ Logout successful');
      this.sessionId = null;
      return true;
    } catch (error) {
      console.error('❌ Logout failed:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }

  // Chạy tất cả tests
  async runAllTests() {
    console.log('🚀 Starting ESXi API Tests...');
    console.log('=' .repeat(50));
    
    // Test 1: Login
    const loginSuccess = await this.testLogin();
    if (!loginSuccess) {
      console.log('\n❌ Cannot proceed without authentication');
      return;
    }

    // Test 2: Get VMs
    const vms = await this.testGetVMs();
    
    // Test 3: Get VM Details (nếu có VM)
    if (vms && vms.length > 0) {
      await this.testGetVMDetails(vms[0].vm);
      await this.testVMPowerOperations(vms[0].vm);
    } else {
      console.log('\n⚠️  No VMs found to test VM operations');
    }

    // Test 4: Get Host Info
    await this.testGetHostInfo();

    // Test 5: Logout
    await this.testLogout();

    console.log('\n🎉 All tests completed!');
    console.log('=' .repeat(50));
  }
}

// Hàm main để chạy test
async function main() {
  console.log('VMware ESXi API Tester');
  console.log('======================');
  console.log('');
  console.log('📝 Before running tests, please update the following in this file:');
  console.log(`   - ESXI_HOST: ${ESXI_HOST}`);
  console.log(`   - ESXI_USERNAME: ${ESXI_USERNAME}`);
  console.log(`   - ESXI_PASSWORD: ${ESXI_PASSWORD}`);
  console.log('');
  console.log('⚠️  Make sure your ESXi host is accessible and credentials are correct.');
  console.log('');

  const tester = new ESXiAPITester();
  await tester.runAllTests();
}

// Chạy test nếu file được execute trực tiếp
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ESXiAPITester;
