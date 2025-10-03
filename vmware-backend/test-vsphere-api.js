const axios = require('axios');
const https = require('https');

// Import config với thông tin ESXi thực tế
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

class VSphereAPITester {
  constructor() {
    this.sessionId = null;
    this.baseURL = esxi.host;
  }

  // Tạo request với session
  async makeRequest(method, endpoint, data = null) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
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

  // Step 1: Authenticate to the API Endpoint
  async authenticate() {
    console.log('🔐 Step 1: Authenticating to vSphere REST API...');
    console.log(`Host: ${this.baseURL}`);
    console.log(`User: ${esxi.username}`);
    
    try {
      const response = await axios.post(`${this.baseURL}/rest/com/vmware/cis/session`, {}, {
        auth: {
          username: esxi.username,
          password: esxi.password
        },
        httpsAgent,
        timeout: test.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      this.sessionId = response.data.value;
      console.log('✅ Authentication successful!');
      console.log(`Session ID: ${this.sessionId}`);
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }

  // Step 2: Use session ID in subsequent calls - Get VMs
  async getVMs() {
    console.log('\n🖥️  Step 2: Getting Virtual Machines...');
    
    const result = await this.makeRequest('GET', '/rest/vcenter/vm');
    
    if (result.success) {
      const vms = result.data.value;
      console.log(`✅ Found ${vms.length} Virtual Machines:`);
      vms.forEach((vm, i) => {
        console.log(`  ${i + 1}. ${vm.name}`);
        console.log(`     ID: ${vm.vm}`);
        console.log(`     Power State: ${vm.power_state}`);
        console.log(`     CPU: ${vm.cpu?.count || 'N/A'} cores`);
        console.log(`     Memory: ${vm.memory?.size_MiB || 'N/A'} MB`);
        console.log(`     Guest OS: ${vm.guest_OS || 'Unknown'}`);
        console.log('');
      });
      return vms;
    } else {
      console.log('❌ Failed to get VMs:', result.error);
      return [];
    }
  }

  // Step 3: Create your first Virtual Machine (Demo - không thực hiện)
  async demonstrateCreateVM() {
    console.log('\n🆕 Step 3: Demonstrate VM Creation (Demo Only)...');
    
    const vmSpec = {
      name: "test-vm-from-api",
      guest_OS: "CENTOS_8_64",
      placement: {
        folder: "vm",
        host: "host-1",
        datastore: "datastore-1"
      },
      hardware: {
        memory: {
          size_MiB: 1024
        },
        cpu: {
          count: 1
        }
      }
    };

    console.log('📋 VM Creation Spec (Demo):');
    console.log(JSON.stringify(vmSpec, null, 2));
    
    console.log('\n⚠️  This is a demonstration only.');
    console.log('   To actually create a VM, uncomment the code below.');
    
    // Uncomment để thực sự tạo VM (CẨN THẬN!)
    /*
    const result = await this.makeRequest('POST', '/rest/vcenter/vm', vmSpec);
    if (result.success) {
      console.log('✅ VM created successfully:', result.data);
    } else {
      console.log('❌ VM creation failed:', result.error);
    }
    */
    
    return true;
  }

  // Step 4: Get details about your VM
  async getVMDetails(vmId) {
    console.log(`\n🔍 Step 4: Getting VM Details for ID: ${vmId}...`);
    
    const result = await this.makeRequest('GET', `/rest/vcenter/vm/${vmId}`);
    
    if (result.success) {
      const vm = result.data.value;
      console.log('✅ VM Details:');
      console.log(`  Name: ${vm.name}`);
      console.log(`  Power State: ${vm.power_state}`);
      console.log(`  CPU Count: ${vm.cpu?.count || 'N/A'}`);
      console.log(`  Memory Size: ${vm.memory?.size_MiB || 'N/A'} MB`);
      console.log(`  Guest OS: ${vm.guest_OS || 'Unknown'}`);
      console.log(`  Hardware Version: ${vm.hardware?.version || 'Unknown'}`);
      console.log(`  Boot Time: ${vm.boot_time || 'N/A'}`);
      console.log(`  Uptime: ${vm.uptime_seconds || 0} seconds`);
      
      // Hiển thị thêm thông tin chi tiết
      if (vm.disks) {
        console.log(`  Disks: ${vm.disks.length} disk(s)`);
        vm.disks.forEach((disk, i) => {
          console.log(`    Disk ${i + 1}: ${disk.value?.capacity || 'N/A'} bytes`);
        });
      }
      
      if (vm.nics) {
        console.log(`  Network Interfaces: ${vm.nics.length} NIC(s)`);
        vm.nics.forEach((nic, i) => {
          console.log(`    NIC ${i + 1}: ${nic.value?.mac_address || 'N/A'}`);
        });
      }
      
      return vm;
    } else {
      console.log('❌ Failed to get VM details:', result.error);
      return null;
    }
  }

  // Test VM Power Operations
  async testVMPowerOperations(vmId) {
    console.log(`\n⚡ Testing VM Power Operations for ID: ${vmId}...`);
    
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

    if (test.skipPowerOperations) {
      console.log('\n⚠️  Power operations skipped for safety');
      console.log('   To test them, set skipPowerOperations: false in config');
    } else {
      console.log('\n🧪 Testing power operations...');
      for (const op of operations) {
        try {
          console.log(`\n🧪 Testing ${op.name}...`);
          const result = await this.makeRequest(op.method, op.endpoint);
          if (result.success) {
            console.log(`✅ ${op.name} command sent successfully`);
          } else {
            console.log(`❌ ${op.name} failed:`, result.error);
          }
        } catch (error) {
          console.log(`❌ ${op.name} error:`, error.message);
        }
      }
    }

    return true;
  }

  // Get Host Information
  async getHostInfo() {
    console.log('\n🖥️  Getting Host Information...');
    
    const result = await this.makeRequest('GET', '/rest/vcenter/host');
    
    if (result.success) {
      const hosts = result.data.value;
      console.log(`✅ Found ${hosts.length} hosts:`);
      hosts.forEach((host, i) => {
        console.log(`  ${i + 1}. ${host.name} (ID: ${host.host})`);
        console.log(`     Connection State: ${host.connection_state}`);
        console.log(`     Power State: ${host.power_state}`);
        console.log(`     CPU Count: ${host.hardware?.cpu?.count || 'N/A'}`);
        console.log(`     Memory Size: ${host.hardware?.memory?.size_MiB || 'N/A'} MB`);
        console.log('');
      });
      return hosts;
    } else {
      console.log('❌ Failed to get host info:', result.error);
      return [];
    }
  }

  // Get Datastore Information
  async getDatastoreInfo() {
    console.log('\n💾 Getting Datastore Information...');
    
    const result = await this.makeRequest('GET', '/rest/vcenter/datastore');
    
    if (result.success) {
      const datastores = result.data.value;
      console.log(`✅ Found ${datastores.length} datastores:`);
      datastores.forEach((ds, i) => {
        console.log(`  ${i + 1}. ${ds.name} (ID: ${ds.datastore})`);
        console.log(`     Type: ${ds.type || 'N/A'}`);
        console.log(`     Capacity: ${ds.capacity || 'N/A'} bytes`);
        console.log(`     Free Space: ${ds.free_space || 'N/A'} bytes`);
        console.log('');
      });
      return datastores;
    } else {
      console.log('❌ Failed to get datastore info:', result.error);
      return [];
    }
  }

  // Logout
  async logout() {
    console.log('\n🚪 Logging out...');
    
    const result = await this.makeRequest('DELETE', '/rest/com/vmware/cis/session');
    
    if (result.success) {
      console.log('✅ Logout successful');
      this.sessionId = null;
    } else {
      console.log('❌ Logout failed:', result.error);
    }
  }

  // Chạy tất cả tests theo vSphere REST API Guide
  async runVSphereTests() {
    console.log('🚀 vSphere REST API Testing');
    console.log('============================');
    console.log('Following the official vSphere REST API guide...');
    console.log('');

    try {
      // Step 1: Authenticate
      const authSuccess = await this.authenticate();
      if (!authSuccess) {
        console.log('❌ Cannot proceed without authentication');
        return;
      }

      // Step 2: Get VMs
      const vms = await this.getVMs();
      
      // Step 3: Demonstrate VM Creation
      await this.demonstrateCreateVM();
      
      // Step 4: Get VM Details (nếu có VM)
      if (vms.length > 0) {
        const testVM = test.testSpecificVM || vms[0].vm;
        await this.getVMDetails(testVM);
        
        // Test power operations
        await this.testVMPowerOperations(testVM);
      } else {
        console.log('\n⚠️  No VMs found to test VM operations');
      }

      // Additional tests
      await this.getHostInfo();
      await this.getDatastoreInfo();

      // Logout
      await this.logout();

      console.log('\n🎉 All vSphere REST API tests completed successfully!');
      console.log('=====================================================');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Chạy test
async function main() {
  const tester = new VSphereAPITester();
  await tester.runVSphereTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VSphereAPITester;
