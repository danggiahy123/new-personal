const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing ESXi Services API...');
  console.log('===============================');

  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Test 2: Login
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123',
      esxiUsername: 'root',
      esxiPassword: '25836926Hy@'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Test 3: Host status
      console.log('\n3️⃣ Testing host status...');
      const statusResponse = await axios.get(`${API_URL}/api/host/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Host status:', statusResponse.data.status);

      // Test 4: Services API
      console.log('\n4️⃣ Testing services API...');
      try {
        const servicesResponse = await axios.get(`${API_URL}/api/host/services`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Services API response:', servicesResponse.data.success);
        if (servicesResponse.data.services) {
          console.log(`📊 Found ${servicesResponse.data.services.length} services`);
        }
      } catch (error) {
        console.log('❌ Services API failed:', error.response?.data?.message || error.message);
      }

      // Test 5: Host info API
      console.log('\n5️⃣ Testing host info API...');
      try {
        const hostInfoResponse = await axios.get(`${API_URL}/api/host/info`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Host info API response:', hostInfoResponse.data.success);
        if (hostInfoResponse.data.hosts) {
          console.log(`📊 Found ${hostInfoResponse.data.hosts.length} hosts`);
        }
      } catch (error) {
        console.log('❌ Host info API failed:', error.response?.data?.message || error.message);
      }

      // Test 6: Storage API
      console.log('\n6️⃣ Testing storage API...');
      try {
        const storageResponse = await axios.get(`${API_URL}/api/host/storage`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Storage API response:', storageResponse.data.success);
        if (storageResponse.data.datastores) {
          console.log(`📊 Found ${storageResponse.data.datastores.length} datastores`);
        }
      } catch (error) {
        console.log('❌ Storage API failed:', error.response?.data?.message || error.message);
      }

      // Test 7: Networking API
      console.log('\n7️⃣ Testing networking API...');
      try {
        const networkingResponse = await axios.get(`${API_URL}/api/host/networking`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Networking API response:', networkingResponse.data.success);
        if (networkingResponse.data.networks) {
          console.log(`📊 Found ${networkingResponse.data.networks.length} networks`);
        }
      } catch (error) {
        console.log('❌ Networking API failed:', error.response?.data?.message || error.message);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }

  console.log('\n🎉 API testing completed!');
}

testAPI();
