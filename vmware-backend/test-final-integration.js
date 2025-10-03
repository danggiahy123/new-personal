const esxiService = require('./services/esxiService');
require('dotenv').config();

async function testFinalIntegration() {
  console.log('🚀 Testing Final ESXi Integration...');
  console.log('📡 ESXi Host:', process.env.ESXI_HOST || 'https://192.168.159.128');
  console.log('');

  try {
    // Test 1: Authentication
    console.log('1️⃣ Testing authentication...');
    const authResult = await esxiService.login('root', 'password');
    
    if (authResult.success) {
      console.log('✅ Authentication successful!');
      console.log('   Session ID:', authResult.sessionId);
      
      // Test 2: Get VMs
      console.log('');
      console.log('2️⃣ Getting VMs...');
      const vmResult = await esxiService.getVMs();
      
      if (vmResult.success) {
        console.log('✅ VMs retrieved successfully!');
        console.log('   VM Count:', vmResult.count);
        if (vmResult.vms && vmResult.vms.length > 0) {
          vmResult.vms.forEach(vm => {
            console.log(`   - ${vm.name} (${vm.power_state})`);
            console.log(`     CPU: ${vm.cpu_count}, Memory: ${vm.memory_size_mb}MB`);
            console.log(`     OS: ${vm.guest_os}`);
          });
        } else {
          console.log('   No VMs found');
        }
      } else {
        console.log('❌ VM retrieval failed:', vmResult.message);
      }

      // Test 3: Get host info
      console.log('');
      console.log('3️⃣ Getting host info...');
      const hostResult = await esxiService.getHostInfo();
      
      if (hostResult.success) {
        console.log('✅ Host info retrieved successfully!');
        console.log('   Host Count:', hostResult.count);
        if (hostResult.hosts && hostResult.hosts.length > 0) {
          const host = hostResult.hosts[0];
          console.log(`   - ${host.name} (${host.connection_state})`);
          console.log(`     Power State: ${host.power_state}`);
        }
      } else {
        console.log('❌ Host info failed:', hostResult.message);
      }

      // Test 4: Get services
      console.log('');
      console.log('4️⃣ Getting services...');
      const servicesResult = await esxiService.getServices();
      
      if (servicesResult.success) {
        console.log('✅ Services retrieved successfully!');
        console.log('   Service Count:', servicesResult.count);
        if (servicesResult.services && servicesResult.services.length > 0) {
          servicesResult.services.forEach(service => {
            console.log(`   - ${service.name} (${service.state})`);
          });
        }
      } else {
        console.log('❌ Services failed:', servicesResult.message);
      }

      // Test 5: Get storage info
      console.log('');
      console.log('5️⃣ Getting storage info...');
      const storageResult = await esxiService.getStorageInfo();
      
      if (storageResult.success) {
        console.log('✅ Storage info retrieved successfully!');
        console.log('   Datastore Count:', storageResult.count);
        if (storageResult.datastores && storageResult.datastores.length > 0) {
          storageResult.datastores.forEach(ds => {
            console.log(`   - ${ds.name} (${ds.utilization_percent}% used)`);
          });
        }
      } else {
        console.log('❌ Storage info failed:', storageResult.message);
      }

      // Test 6: Get networking info
      console.log('');
      console.log('6️⃣ Getting networking info...');
      const networkResult = await esxiService.getNetworkingInfo();
      
      if (networkResult.success) {
        console.log('✅ Networking info retrieved successfully!');
        console.log('   Network Count:', networkResult.count);
        if (networkResult.networks && networkResult.networks.length > 0) {
          networkResult.networks.forEach(network => {
            console.log(`   - ${network.name} (${network.type})`);
          });
        }
      } else {
        console.log('❌ Networking info failed:', networkResult.message);
      }

      // Test 7: Session info
      console.log('');
      console.log('7️⃣ Getting session info...');
      const sessionInfo = esxiService.getSessionInfo();
      console.log('✅ Session info:');
      console.log(`   Authenticated: ${sessionInfo.authenticated}`);
      console.log(`   Username: ${sessionInfo.username}`);
      console.log(`   ESXi Host: ${sessionInfo.esxiHost}`);
      console.log(`   API Type: ${sessionInfo.apiType || 'REST'}`);

      // Logout
      console.log('');
      console.log('8️⃣ Logging out...');
      await esxiService.logout();
      console.log('✅ Logout successful');

    } else {
      console.log('❌ Authentication failed:', authResult.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('');
  console.log('🎉 Final integration test completed!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Start the backend server: npm run dev');
  console.log('2. Open the frontend application');
  console.log('3. Login with your user credentials and ESXi credentials');
  console.log('4. Start managing your VMs!');
  console.log('');
  console.log('🔗 Available API Endpoints:');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/vms');
  console.log('   GET  /api/host/info');
  console.log('   GET  /api/host/services');
  console.log('   GET  /api/host/storage');
  console.log('   GET  /api/host/networking');
}

testFinalIntegration();
