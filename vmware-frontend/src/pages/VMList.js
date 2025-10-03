import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vmService } from '../services/vmService';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Monitor, 
  Cpu, 
  HardDrive,
  Search,
  Filter,
  MoreVertical,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const VMList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVM, setSelectedVM] = useState(null);

  const { data: vmsData, isLoading, error } = useQuery(
    'vms',
    vmService.getVMs,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const startVMMutation = useMutation(vmService.startVM, {
    onSuccess: () => {
      queryClient.invalidateQueries('vms');
      toast.success('VM start command sent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start VM');
    },
  });

  const stopVMMutation = useMutation(vmService.stopVM, {
    onSuccess: () => {
      queryClient.invalidateQueries('vms');
      toast.success('VM stop command sent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to stop VM');
    },
  });

  const restartVMMutation = useMutation(vmService.restartVM, {
    onSuccess: () => {
      queryClient.invalidateQueries('vms');
      toast.success('VM restart command sent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to restart VM');
    },
  });

  const vms = vmsData?.vms || [];

  // Filter VMs based on search term and status
  const filteredVMs = vms.filter(vm => {
    const matchesSearch = vm.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'running' && vm.power_state === 'POWERED_ON') ||
      (filterStatus === 'stopped' && vm.power_state === 'POWERED_OFF');
    
    return matchesSearch && matchesStatus;
  });

  const handleStartVM = (vmId) => {
    startVMMutation.mutate(vmId);
  };

  const handleStopVM = (vmId) => {
    stopVMMutation.mutate(vmId);
  };

  const handleRestartVM = (vmId) => {
    restartVMMutation.mutate(vmId);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Virtual Machines</h1>
              <p className="text-gray-600">Manage your ESXi virtual machines</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => queryClient.invalidateQueries('vms')}
                className="btn btn-secondary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search VMs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input"
                >
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="stopped">Stopped</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* VM Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vmware-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading virtual machines...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load virtual machines</p>
          </div>
        ) : filteredVMs.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No virtual machines found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVMs.map((vm) => (
              <div key={vm.id} className="vm-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      vm.power_state === 'POWERED_ON' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vm.name}</h3>
                      <p className="text-sm text-gray-500">ID: {vm.id}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedVM(selectedVM === vm.id ? null : vm.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {selectedVM === vm.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate(`/vms/${vm.id}`);
                              setSelectedVM(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(vm.power_state)}`}>
                      {getStatusText(vm.power_state)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">CPU</span>
                    <span className="text-sm font-medium text-gray-900">{vm.cpu_count} cores</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Memory</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(vm.memory_size_mb / 1024)} GB
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">OS</span>
                    <span className="text-sm font-medium text-gray-900">{vm.guest_os}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {vm.power_state === 'POWERED_ON' ? (
                    <>
                      <button
                        onClick={() => handleStopVM(vm.id)}
                        disabled={stopVMMutation.isLoading}
                        className="btn btn-danger flex-1 text-sm"
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Stop
                      </button>
                      <button
                        onClick={() => handleRestartVM(vm.id)}
                        disabled={restartVMMutation.isLoading}
                        className="btn btn-warning flex-1 text-sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Restart
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStartVM(vm.id)}
                      disabled={startVMMutation.isLoading}
                      className="btn btn-success w-full text-sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{vms.length}</p>
              <p className="text-sm text-gray-500">Total VMs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {vms.filter(vm => vm.power_state === 'POWERED_ON').length}
              </p>
              <p className="text-sm text-gray-500">Running</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {vms.filter(vm => vm.power_state === 'POWERED_OFF').length}
              </p>
              <p className="text-sm text-gray-500">Stopped</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-vmware-600">
                {Math.round(vms.reduce((sum, vm) => sum + (vm.memory_size_mb || 0), 0) / 1024)} GB
              </p>
              <p className="text-sm text-gray-500">Total Memory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VMList;
