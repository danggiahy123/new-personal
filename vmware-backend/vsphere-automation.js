const axios = require('axios');
const https = require('https');

/**
 * VMware vSphere REST API Automation
 * Tự động hóa tương tác với ESXi Host qua vSphere REST API
 */

class VSphereAutomation {
  constructor() {
    // Thông tin cấu hình ESXi Host
    this.esxiHost = 'https://192.168.159.128'; // Sửa IP theo ESXi của bạn
    this.username = 'root';
    this.password = '25836926Hy@';
    this.sessionId = null;
    
    // Cấu hình HTTPS Agent để bỏ qua SSL certificate verification
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false // Bỏ qua lỗi SSL/TLS Certificate
    });
    
    // Cấu hình axios instance
    this.api = axios.create({
      baseURL: this.esxiHost,
      httpsAgent: this.httpsAgent,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Mã hóa thông tin đăng nhập sang Base64
   * @returns {string} Base64 encoded credentials
   */
  encodeCredentials() {
    const credentials = `${this.username}:${this.password}`;
    return Buffer.from(credentials).toString('base64');
  }

  /**
   * Bước 1: Xác thực với ESXi Host
   * @returns {Promise<Object>} Kết quả authentication
   */
  async authenticate() {
    try {
      console.log('🔐 Bước 1: Xác thực với ESXi Host...');
      console.log(`Host: ${this.esxiHost}`);
      console.log(`User: ${this.username}`);
      
      // Mã hóa thông tin đăng nhập
      const encodedCredentials = this.encodeCredentials();
      console.log(`Base64 Credentials: ${encodedCredentials}`);
      
      // Gửi yêu cầu POST đến /api/session
      const response = await this.api.post('/api/session', {}, {
        headers: {
          'Authorization': `Basic ${encodedCredentials}`
        }
      });
      
      console.log('✅ Authentication successful!');
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      
      // Lưu Session ID từ header vmware-api-session-id
      this.sessionId = response.headers['vmware-api-session-id'];
      
      if (this.sessionId) {
        console.log(`Session ID: ${this.sessionId}`);
        
        // Cập nhật axios instance với session ID
        this.api.defaults.headers['vmware-api-session-id'] = this.sessionId;
        
        return {
          success: true,
          sessionId: this.sessionId,
          message: 'Authentication successful'
        };
      } else {
        throw new Error('Session ID not found in response headers');
      }
      
    } catch (error) {
      console.error('❌ Authentication failed:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Authentication failed',
        error: error.message
      };
    }
  }

  /**
   * Bước 2: Lấy thông tin Host
   * @returns {Promise<Object>} Thông tin Host
   */
  async getHostInfo() {
    try {
      console.log('\n🖥️ Bước 2: Lấy thông tin Host...');
      
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please call authenticate() first.');
      }
      
      // Gửi yêu cầu GET đến /api/host
      const response = await this.api.get('/api/host', {
        headers: {
          'vmware-api-session-id': this.sessionId
        }
      });
      
      console.log('✅ Host info retrieved successfully!');
      console.log('Response Status:', response.status);
      
      // In kết quả JSON đầy đủ
      console.log('\n📋 Thông tin Host (JSON):');
      console.log(JSON.stringify(response.data, null, 2));
      
      return {
        success: true,
        data: response.data,
        message: 'Host info retrieved successfully'
      };
      
    } catch (error) {
      console.error('❌ Failed to get host info:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get host info',
        error: error.message
      };
    }
  }

  /**
   * Bước 3: Lấy danh sách Virtual Machines
   * @returns {Promise<Object>} Danh sách VMs
   */
  async getVirtualMachines() {
    try {
      console.log('\n🖥️ Bước 3: Lấy danh sách Virtual Machines...');
      
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please call authenticate() first.');
      }
      
      // Gửi yêu cầu GET đến /api/vms
      const response = await this.api.get('/api/vms', {
        headers: {
          'vmware-api-session-id': this.sessionId
        }
      });
      
      console.log('✅ VMs retrieved successfully!');
      console.log('Response Status:', response.status);
      
      // In kết quả JSON đầy đủ
      console.log('\n📋 Danh sách Virtual Machines (JSON):');
      console.log(JSON.stringify(response.data, null, 2));
      
      return {
        success: true,
        data: response.data,
        message: 'VMs retrieved successfully'
      };
      
    } catch (error) {
      console.error('❌ Failed to get VMs:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get VMs',
        error: error.message
      };
    }
  }

  /**
   * Bước 4: Logout khỏi ESXi
   * @returns {Promise<Object>} Kết quả logout
   */
  async logout() {
    try {
      console.log('\n🚪 Bước 4: Logout khỏi ESXi...');
      
      if (!this.sessionId) {
        console.log('ℹ️ No active session to logout');
        return { success: true, message: 'No active session' };
      }
      
      // Gửi yêu cầu DELETE đến /api/session
      await this.api.delete('/api/session', {
        headers: {
          'vmware-api-session-id': this.sessionId
        }
      });
      
      console.log('✅ Logout successful');
      
      // Xóa session ID
      this.sessionId = null;
      delete this.api.defaults.headers['vmware-api-session-id'];
      
      return {
        success: true,
        message: 'Logout successful'
      };
      
    } catch (error) {
      console.error('❌ Logout failed:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed',
        error: error.message
      };
    }
  }

  /**
   * Chạy toàn bộ quy trình automation
   * @returns {Promise<void>}
   */
  async runAutomation() {
    try {
      console.log('🚀 VMware vSphere REST API Automation');
      console.log('=====================================');
      console.log('');
      
      // Bước 1: Xác thực
      const authResult = await this.authenticate();
      if (!authResult.success) {
        throw new Error('Authentication failed');
      }
      
      // Bước 2: Lấy thông tin Host
      const hostResult = await this.getHostInfo();
      if (!hostResult.success) {
        console.log('⚠️ Failed to get host info, continuing...');
      }
      
      // Bước 3: Lấy danh sách VMs
      const vmsResult = await this.getVirtualMachines();
      if (!vmsResult.success) {
        console.log('⚠️ Failed to get VMs, continuing...');
      }
      
      // Bước 4: Logout
      await this.logout();
      
      console.log('\n🎉 Automation completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Automation failed:', error.message);
      
      // Cố gắng logout nếu có session
      if (this.sessionId) {
        await this.logout();
      }
    }
  }
}

// Hàm chính để chạy automation
async function main() {
  const vsphere = new VSphereAutomation();
  await vsphere.runAutomation();
}

// Export class để sử dụng trong các module khác
module.exports = VSphereAutomation;

// Chạy automation nếu file được execute trực tiếp
if (require.main === module) {
  main().catch(console.error);
}
