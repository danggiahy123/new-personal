import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vmService } from '../services/vmService';
import { 
  ArrowLeft,
  Play, 
  Square, 
  RefreshCw, 
  Monitor, 
  Cpu, 
  HardDrive,
  Clock,
  Server,
  Activity,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const VMDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: vmData, isLoading, error } = useQuery(
    ['vm', id],
    () => vmService.getVMDetails(id),
    {
      enabled: !!id,
    }
  );

  const startVMMutation = useMutation(vmService.startVM, {
    onSuccess: () => {
      queryClient.invalidateQueries(['vm', id]);
      queryClient.invalidateQueries('vms');
      toast.success('VM start command sent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start VM');
    },
  });

  const stopVMMutation = useMutation(vmService.stopVM, {
    onSuccess: () => {
      queryClient.invalidateQueries(['vm', id]);
      queryClient.invalidateQueries('vms');
      toast.success('VM stop command sent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to stop VM');
    },
  });

  const restartVMMutation = useMutation(vmService.restartVM, {
    onSuccess: () => {
      queryClient.invalidateQueries(['vm', id]);
      queryClient.invalidateQueries('vms');
      toast.success('VM restart command sent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to restart VM');
    },
  });

  const vm = vmData?.vm;

  const getStatusColor = (status) => {
    switch (status) {
      case 'POWERED_ON':
        return 'status-running';
      case 'POWERED_OFF':
        return 'status-stopped';
      default:
        return 'status-suspended';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'POWERED_ON':
        return 'Running';
      case 'POWERED_OFF':
        return 'Stopped';
      default:
        return 'Suspended';
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vmware-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading VM details...</p>
        </div>
      </div>
    );
  }

  if (error || !vm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load VM details</p>
          <button
            onClick={() => navigate('/vms')}
            className="btn btn-primary mt-4"
          >
            Back to VMs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/vms')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{vm.name}</h1>
              <p className="text-gray-600">Virtual Machine Details</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vm.power_state)}`}>
                {getStatusText(vm.power_state)}
              </span>
              {vm.power_state === 'POWERED_ON' ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => stopVMMutation.mutate(vm.vm)}
                    disabled={stopVMMutation.isLoading}
                    className="btn btn-danger"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </button>
                  <button
                    onClick={() => restartVMMutation.mutate(vm.vm)}
                    disabled={restartVMMutation.isLoading}
                    className="btn btn-warning"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startVMMutation.mutate(vm.vm)}
                  disabled={startVMMutation.isLoading}
                  className="btn btn-success"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">VM ID</label>
                  <p className="text-sm text-gray-900 font-mono">{vm.vm}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{vm.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Guest OS</label>
                  <p className="text-sm text-gray-900">{vm.guest_OS || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hardware Version</label>
                  <p className="text-sm text-gray-900">{vm.hardware?.version || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Hardware Configuration */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hardware Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Cpu className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPU</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {vm.cpu?.count || 0} cores
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <HardDrive className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Memory</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.round((vm.memory?.size_MiB || 0) / 1024)} GB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Power Management */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Power Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current State</label>
                  <p className="text-sm text-gray-900">{getStatusText(vm.power_state)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Boot Time</label>
                  <p className="text-sm text-gray-900">{formatDate(vm.boot_time)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Uptime</label>
                  <p className="text-sm text-gray-900">{formatUptime(vm.uptime_seconds)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Power State</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vm.power_state)}`}>
                    {getStatusText(vm.power_state)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">CPU Usage</span>
                  <span className="text-sm font-medium text-gray-900">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Memory Usage</span>
                  <span className="text-sm font-medium text-gray-900">N/A</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {vm.power_state === 'POWERED_ON' ? (
                  <>
                    <button
                      onClick={() => stopVMMutation.mutate(vm.vm)}
                      disabled={stopVMMutation.isLoading}
                      className="btn btn-danger w-full"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop VM
                    </button>
                    <button
                      onClick={() => restartVMMutation.mutate(vm.vm)}
                      disabled={restartVMMutation.isLoading}
                      className="btn btn-warning w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart VM
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startVMMutation.mutate(vm.vm)}
                    disabled={startVMMutation.isLoading}
                    className="btn btn-success w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start VM
                  </button>
                )}
              </div>
            </div>

            {/* System Info */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Info</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Server className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">ESXi Host</p>
                    <p className="text-sm font-medium text-gray-900">192.168.159.128</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Connection</p>
                    <p className="text-sm font-medium text-green-600">Active</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Last Refresh</p>
                    <p className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VMDetails;
