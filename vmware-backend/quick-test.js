const axios = require('axios');

async function quickTest() {
  try {
    console.log('Testing API...');
    
    // Test health
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health:', health.data.status);
    
    // Test login
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123',
      esxiUsername: 'root',
      esxiPassword: '25836926Hy@'
    });
    
    if (login.data.success) {
      console.log('✅ Login successful');
      const token = login.data.token;
      
      // Test services
      try {
        const services = await axios.get('http://localhost:5000/api/host/services', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Services API:', services.data.success);
        console.log('📊 Services count:', services.data.count || 0);
      } catch (e) {
        console.log('❌ Services API failed:', e.response?.data?.message || e.message);
      }
      
    } else {
      console.log('❌ Login failed:', login.data.message);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

quickTest();
