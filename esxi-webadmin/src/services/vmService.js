import api from './authService';

export const vmService = {
  async getVMs() {
    try {
      const response = await api.get('/api/vms');
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error('Get VMs error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch VMs',
        data: [],
      };
    }
  },

  async startVM(vmId) {
    try {
      const response = await api.post(`/api/vms/${vmId}/start`);
      return {
        success: true,
        message: response.data.message || 'VM started successfully',
      };
    } catch (error) {
      console.error('Start VM error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to start VM',
      };
    }
  },

  async stopVM(vmId) {
    try {
      const response = await api.post(`/api/vms/${vmId}/stop`);
      return {
        success: true,
        message: response.data.message || 'VM stopped successfully',
      };
    } catch (error) {
      console.error('Stop VM error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to stop VM',
      };
    }
  },

  async restartVM(vmId) {
    try {
      const response = await api.post(`/api/vms/${vmId}/restart`);
      return {
        success: true,
        message: response.data.message || 'VM restarted successfully',
      };
    } catch (error) {
      console.error('Restart VM error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to restart VM',
      };
    }
  },

  async suspendVM(vmId) {
    try {
      const response = await api.post(`/api/vms/${vmId}/suspend`);
      return {
        success: true,
        message: response.data.message || 'VM suspended successfully',
      };
    } catch (error) {
      console.error('Suspend VM error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to suspend VM',
      };
    }
  },

  async getVMDetails(vmId) {
    try {
      const response = await api.get(`/api/vms/${vmId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Get VM details error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch VM details',
      };
    }
  },
};
