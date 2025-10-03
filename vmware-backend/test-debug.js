const axios = require('axios');
const https = require('https');

// Debug test để kiểm tra kết nối ESXi
const ESXI_HOST = 'https://192.168.159.128';
const ESXI_USERNAME = 'root';
const ESXI_PASSWORD = '25836926Hy@';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function debugTest() {
  console.log('🔍 Debug ESXi Connection...');
  console.log(`Host: ${ESXI_HOST}`);
  console.log(`User: ${ESXI_USERNAME}`);
  console.log('');

  // Test 1: Kiểm tra kết nối cơ bản
  console.log('1️⃣ Testing basic connection...');
  try {
    const response = await axios.get(`${ESXI_HOST}/rest/com/vmware/cis/session`, {
      httpsAgent,
      timeout: 10000,
      auth: {
        username: ESXI_USERNAME,
        password: ESXI_PASSWORD
      }
    });
    console.log('✅ Basic connection successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Basic connection failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
  }

  console.log('');

  // Test 2: Test với POST method
  console.log('2️⃣ Testing POST authentication...');
  try {
    const response = await axios.post(`${ESXI_HOST}/rest/com/vmware/cis/session`, {}, {
      httpsAgent,
      timeout: 10000,
      auth: {
        username: ESXI_USERNAME,
        password: ESXI_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ POST authentication successful');
    console.log('Session ID:', response.data.value);
  } catch (error) {
    console.log('❌ POST authentication failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    console.log('Headers:', error.response?.headers);
  }

  console.log('');

  // Test 3: Test với different endpoint
  console.log('3️⃣ Testing different endpoint...');
  try {
    const response = await axios.post(`${ESXI_HOST}/api/session`, {}, {
      httpsAgent,
      timeout: 10000,
      auth: {
        username: ESXI_USERNAME,
        password: ESXI_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ Alternative endpoint successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Alternative endpoint failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
  }

  console.log('');

  // Test 4: Test với curl command equivalent
  console.log('4️⃣ Testing curl equivalent...');
  try {
    const response = await axios({
      method: 'POST',
      url: `${ESXI_HOST}/rest/com/vmware/cis/session`,
      data: {},
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
    console.log('✅ Curl equivalent successful');
    console.log('Session ID:', response.data.value);
  } catch (error) {
    console.log('❌ Curl equivalent failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
  }
}

debugTest().catch(console.error);
