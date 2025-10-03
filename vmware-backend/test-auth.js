const axios = require('axios');

async function testESXiAuth(username, password) {
  console.log(`Testing ESXi authentication for ${username}...`);
  
  try {
    const response = await axios.get('https://192.168.159.128/api/session', {
      auth: {
        username: username,
        password: password
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      }),
      timeout: 5000
    });
    
    console.log('✅ Authentication successful!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('❌ Authentication failed: Invalid credentials');
      return false;
    } else {
      console.log('❌ Connection error:', error.message);
      return false;
    }
  }
}

// Test với mật khẩu sai
testESXiAuth('root', 'wrongpassword').then(result => {
  console.log('Wrong password result:', result);
  
  // Test với mật khẩu đúng (nếu bạn có)
  // testESXiAuth('root', 'your-real-password').then(result => {
  //   console.log('Correct password result:', result);
  // });
});
