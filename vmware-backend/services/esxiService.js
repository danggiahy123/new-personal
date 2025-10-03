const axios = require('axios');

class ESXiService {
  constructor() {
    this.baseURL = process.env.ESXI_HOST || 'https://192.168.159.128';
    this.sessionId = null;
    this.username = null;
    this.password = null;
    
    // Create axios instance with SSL bypass
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false // Bypass self-signed SSL
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // Login to ESXi and get session ID
  async login(username, password) {
    try {
      this.username = username;
      this.password = password;

      const response = await this.api.post('/rest/com/vmware/cis/session', {}, {
        auth: {
          username: username,
          password: password
        }
      });

      this.sessionId = response.data.value;
      
      // Set session ID for future requests
      this.api.defaults.headers['vmware-api-session-id'] = this.sessionId;

      console.log('✅ ESXi login successful, session ID:', this.sessionId);
      return {
        success: true,
        sessionId: this.sessionId,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('❌ ESXi login failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'ESXi login failed',
        error: error.response?.data || error.message
      };
    }
  }

  // Get list of VMs
  async getVMs() {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await this.api.get('/rest/vcenter/vm');
      
      // Transform VM data to a cleaner format
      const vms = response.data.value.map(vm => ({
        id: vm.vm,
        name: vm.name,
        power_state: vm.power_state,
        cpu_count: vm.cpu?.count || 0,
        memory_size_mb: vm.memory?.size_MiB || 0,
        guest_os: vm.guest_OS || 'Unknown',
        hardware_version: vm.hardware?.version || 'Unknown',
        boot_time: vm.boot_time || null,
        uptime_seconds: vm.uptime_seconds || 0
      }));

      return {
        success: true,
        vms: vms,
        count: vms.length
      };
    } catch (error) {
      console.error('❌ Failed to get VMs:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get VMs',
        error: error.response?.data || error.message
      };
    }
  }

  // Start VM
  async startVM(vmId) {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await this.api.post(`/rest/vcenter/vm/${vmId}/power/start`);
      
      return {
        success: true,
        message: 'VM start command sent successfully',
        vmId: vmId
      };
    } catch (error) {
      console.error('❌ Failed to start VM:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to start VM',
        error: error.response?.data || error.message
      };
    }
  }

  // Stop VM
  async stopVM(vmId) {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await this.api.post(`/rest/vcenter/vm/${vmId}/power/stop`);
      
      return {
        success: true,
        message: 'VM stop command sent successfully',
        vmId: vmId
      };
    } catch (error) {
      console.error('❌ Failed to stop VM:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to stop VM',
        error: error.response?.data || error.message
      };
    }
  }

  // Restart VM
  async restartVM(vmId) {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await this.api.post(`/rest/vcenter/vm/${vmId}/power/restart`);
      
      return {
        success: true,
        message: 'VM restart command sent successfully',
        vmId: vmId
      };
    } catch (error) {
      console.error('❌ Failed to restart VM:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to restart VM',
        error: error.response?.data || error.message
      };
    }
  }

  // Get VM details
  async getVMDetails(vmId) {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await this.api.get(`/rest/vcenter/vm/${vmId}`);
      
      return {
        success: true,
        vm: response.data.value
      };
    } catch (error) {
      console.error('❌ Failed to get VM details:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get VM details',
        error: error.response?.data || error.message
      };
    }
  }

  // Logout from ESXi
  async logout() {
    try {
      if (!this.sessionId) {
        return { success: true, message: 'Already logged out' };
      }

      await this.api.delete('/rest/com/vmware/cis/session');
      
      this.sessionId = null;
      this.username = null;
      this.password = null;
      delete this.api.defaults.headers['vmware-api-session-id'];

      console.log('✅ ESXi logout successful');
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('❌ ESXi logout failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'ESXi logout failed',
        error: error.response?.data || error.message
      };
    }
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.sessionId;
  }

  // Get ESXi host services information
  async getServices() {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      // Try different possible endpoints for services
      const endpoints = [
        '/rest/vcenter/host/services',
        '/rest/appliance/services',
        '/rest/host/services',
        '/rest/com/vmware/appliance/services'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.api.get(endpoint);
          
          if (response.data && response.data.value) {
            // Transform services data to a cleaner format
            const services = response.data.value.map(service => ({
              key: service.key,
              name: service.name || service.key,
              state: service.state,
              startup_type: service.startup_type,
              description: service.description || '',
              health: service.health || 'unknown'
            }));

            return {
              success: true,
              services: services,
              count: services.length,
              endpoint: endpoint
            };
          }
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.response?.status);
          continue;
        }
      }

      // If no endpoint works, try to get host information
      return await this.getHostInfo();

    } catch (error) {
      console.error('❌ Failed to get services:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get services',
        error: error.response?.data || error.message
      };
    }
  }

  // Get ESXi host information
  async getHostInfo() {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await this.api.get('/rest/vcenter/host');
      
      if (response.data && response.data.value) {
        const hosts = response.data.value.map(host => ({
          host: host.host,
          name: host.name,
          connection_state: host.connection_state,
          power_state: host.power_state,
          boot_time: host.boot_time,
          hardware: host.hardware || {},
          cpu: host.cpu || {},
          memory: host.memory || {},
          storage: host.storage || {},
          networking: host.networking || {}
        }));

        return {
          success: true,
          hosts: hosts,
          count: hosts.length,
          message: 'Host information retrieved successfully'
        };
      }

      return {
        success: false,
        message: 'No host information available'
      };

    } catch (error) {
      console.error('❌ Failed to get host info:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get host info',
        error: error.response?.data || error.message
      };
    }
  }

  // Get ESXi host storage information
  async getStorageInfo() {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await this.api.get('/rest/vcenter/datastore');
      
      if (response.data && response.data.value) {
        const datastores = response.data.value.map(ds => ({
          datastore: ds.datastore,
          name: ds.name,
          type: ds.type,
          accessible: ds.accessible,
          capacity: ds.capacity,
          free_space: ds.free_space,
          used_space: ds.capacity - ds.free_space,
          utilization_percent: ((ds.capacity - ds.free_space) / ds.capacity * 100).toFixed(2)
        }));

        return {
          success: true,
          datastores: datastores,
          count: datastores.length
        };
      }

      return {
        success: false,
        message: 'No storage information available'
      };

    } catch (error) {
      console.error('❌ Failed to get storage info:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get storage info',
        error: error.response?.data || error.message
      };
    }
  }

  // Get ESXi host networking information
  async getNetworkingInfo() {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated. Please login first.');
      }

      const response = await this.api.get('/rest/vcenter/network');
      
      if (response.data && response.data.value) {
        const networks = response.data.value.map(network => ({
          network: network.network,
          name: network.name,
          type: network.type,
          accessible: network.accessible
        }));

        return {
          success: true,
          networks: networks,
          count: networks.length
        };
      }

      return {
        success: false,
        message: 'No networking information available'
      };

    } catch (error) {
      console.error('❌ Failed to get networking info:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get networking info',
        error: error.response?.data || error.message
      };
    }
  }

  // Get current session info
  getSessionInfo() {
    return {
      authenticated: this.isAuthenticated(),
      sessionId: this.sessionId,
      username: this.username,
      esxiHost: this.baseURL
    };
  }
}

// Export singleton instance
module.exports = new ESXiService();
