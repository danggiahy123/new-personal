const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting VMware ESXi Management System...');
console.log('📡 ESXi Host:', process.env.ESXI_HOST || 'https://192.168.159.128');
console.log('');

// Start backend server
console.log('1️⃣ Starting backend server...');
const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: true
});

backendProcess.on('error', (error) => {
  console.error('❌ Backend server failed to start:', error.message);
});

backendProcess.on('exit', (code) => {
  console.log(`Backend server exited with code ${code}`);
});

// Wait a bit for backend to start
setTimeout(() => {
  console.log('');
  console.log('2️⃣ Backend server should be running on http://localhost:5000');
  console.log('');
  console.log('📋 Available API Endpoints:');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/vms');
  console.log('   GET  /api/host/info');
  console.log('   GET  /api/host/services');
  console.log('   GET  /api/host/storage');
  console.log('   GET  /api/host/networking');
  console.log('');
  console.log('🌐 Frontend Applications:');
  console.log('   VMware Frontend: http://localhost:3000');
  console.log('   VMware Web Admin: http://localhost:3001');
  console.log('');
  console.log('🔑 Login Credentials:');
  console.log('   Username: admin (or create new user)');
  console.log('   Password: password (or your custom password)');
  console.log('   ESXi Username: root');
  console.log('   ESXi Password: password (or your ESXi password)');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('1. Open frontend application in browser');
  console.log('2. Login with your credentials');
  console.log('3. Start managing your VMs!');
  console.log('');
  console.log('Press Ctrl+C to stop the system');
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down system...');
  backendProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down system...');
  backendProcess.kill('SIGTERM');
  process.exit(0);
});
