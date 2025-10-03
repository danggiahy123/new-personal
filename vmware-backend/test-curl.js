const { exec } = require('child_process');

console.log('🧪 Testing API with curl...');

// Test health endpoint
exec('curl http://localhost:5000/api/health', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }
  
  console.log('✅ Health check response:', stdout);
  
  // Test login
  const loginCmd = 'curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\\"username\\":\\"admin\\",\\"password\\":\\"admin123\\",\\"esxiUsername\\":\\"root\\",\\"esxiPassword\\":\\"25836926Hy@\\"}"';
  
  exec(loginCmd, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Login failed:', error.message);
      return;
    }
    
    console.log('✅ Login response:', stdout);
    
    // Try to extract token and test services
    try {
      const response = JSON.parse(stdout);
      if (response.success && response.token) {
        console.log('✅ Login successful, token received');
        
        // Test services API
        const servicesCmd = `curl -H "Authorization: Bearer ${response.token}" http://localhost:5000/api/host/services`;
        
        exec(servicesCmd, (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Services API failed:', error.message);
            return;
          }
          
          console.log('✅ Services API response:', stdout);
        });
      } else {
        console.log('❌ Login response invalid:', response.message);
      }
    } catch (e) {
      console.log('❌ Failed to parse login response:', e.message);
    }
  });
});
