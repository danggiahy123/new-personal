// File cấu hình test ESXi API
// Copy file này thành test-config-local.js và điền thông tin của bạn

module.exports = {
  // Thông tin ESXi Host
  esxi: {
    host: 'https://192.168.159.128', // IP của ESXi host
    username: 'root', // Username ESXi
    password: 'your-password-here' // Password ESXi - THAY ĐỔI NGAY!
  },

  // Cấu hình test
  test: {
    timeout: 15000, // Timeout cho mỗi request (ms)
    skipPowerOperations: true, // Bỏ qua test power operations (an toàn)
    testSpecificVM: null // ID của VM cụ thể để test (null = test VM đầu tiên)
  },

  // Các endpoint sẽ được test
  endpoints: {
    login: '/rest/com/vmware/cis/session',
    vms: '/rest/vcenter/vm',
    hosts: '/rest/vcenter/host',
    vmDetails: '/rest/vcenter/vm/{vmId}',
    vmStart: '/rest/vcenter/vm/{vmId}/power/start',
    vmStop: '/rest/vcenter/vm/{vmId}/power/stop',
    vmRestart: '/rest/vcenter/vm/{vmId}/power/restart'
  }
};
