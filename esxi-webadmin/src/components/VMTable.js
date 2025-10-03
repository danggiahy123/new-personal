import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vmService } from '../services/vmService';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Pause, 
  RefreshCw, 
  Server, 
  Cpu, 
  HardDrive,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const VMTable = () => {
  const queryClient = useQueryClient();
  const [selectedVMs, setSelectedVMs] = useState([]);

  // Fetch VMs
  const { data: vmsData, isLoading, error, refetch } = useQuery(
    'vms',
    vmService.getVMs,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 2,
    }
  );

  // VM Actions Mutations
  const startVMMutation = useMutation(vmService.startVM, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries('vms');
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error('Failed to start VM');
    },
  });

  const stopVMMutation = useMutation(vmService.stopVM, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries('vms');
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error('Failed to stop VM');
    },
  });

  const restartVMMutation = useMutation(vmService.restartVM, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries('vms');
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error('Failed to restart VM');
    },
  });

  const suspendVMMutation = useMutation(vmService.suspendVM, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries('vms');
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error('Failed to suspend VM');
    },
  });

  const handleVMAction = (vmId, action) => {
    switch (action) {
      case 'start':
        startVMMutation.mutate(vmId);
        break;
      case 'stop':
        stopVMMutation.mutate(vmId);
        break;
      case 'restart':
        restartVMMutation.mutate(vmId);
        break;
      case 'suspend':
        suspendVMMutation.mutate(vmId);
        break;
      default:
        break;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'powered_on':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'powered_off':
      case 'stopped':
        return <Square className="h-4 w-4 text-red-500" />;
      case 'suspended':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'powered_on':
      case 'running':
        return 'status-running';
      case 'powered_off':
      case 'stopped':
        return 'status-stopped';
      case 'suspended':
        return 'status-suspended';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatMemory = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const formatCPU = (cpu) => {
    if (!cpu) return '0 vCPU';
    return `${cpu} vCPU`;
  };

  const isActionLoading = (vmId) => {
    return (
      startVMMutation.isLoading ||
      stopVMMutation.isLoading ||
      restartVMMutation.isLoading ||
      suspendVMMutation.isLoading
    );
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vmware-600"></div>
          <span className="text-vsphere-600">Loading virtual machines...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-vsphere-900 mb-2">Failed to load VMs</h3>
          <p className="text-vsphere-600 mb-4">Unable to connect to ESXi host</p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const vms = vmsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-vsphere-900">Virtual Machines</h2>
          <p className="text-vsphere-600 mt-1">
            Manage your ESXi virtual machines ({vms.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* VM Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-vsphere-200">
            <thead className="bg-vsphere-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-vsphere-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-vsphere-300 text-vmware-600 focus:ring-vmware-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVMs(vms.map(vm => vm.id));
                      } else {
                        setSelectedVMs([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vsphere-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vsphere-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vsphere-500 uppercase tracking-wider">
                  CPU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vsphere-500 uppercase tracking-wider">
                  Memory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vsphere-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-vsphere-200">
              {vms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Server className="h-12 w-12 text-vsphere-400" />
                      <h3 className="text-lg font-medium text-vsphere-900">No Virtual Machines</h3>
                      <p className="text-vsphere-600">No VMs found on this ESXi host</p>
                    </div>
                  </td>
                </tr>
              ) : (
                vms.map((vm) => (
                  <tr key={vm.id} className="hover:bg-vsphere-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-vsphere-300 text-vmware-600 focus:ring-vmware-500"
                        checked={selectedVMs.includes(vm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVMs([...selectedVMs, vm.id]);
                          } else {
                            setSelectedVMs(selectedVMs.filter(id => id !== vm.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Server className="h-5 w-5 text-vsphere-400" />
                        <div>
                          <div className="text-sm font-medium text-vsphere-900">
                            {vm.name || 'Unknown VM'}
                          </div>
                          <div className="text-sm text-vsphere-500">
                            ID: {vm.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(vm.power_state)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vm.power_state)}`}>
                          {vm.power_state || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-vsphere-400" />
                        <span className="text-sm text-vsphere-900">
                          {formatCPU(vm.cpu)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-vsphere-400" />
                        <span className="text-sm text-vsphere-900">
                          {formatMemory(vm.memory_size)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {vm.power_state?.toLowerCase() === 'powered_off' || vm.power_state?.toLowerCase() === 'stopped' ? (
                          <button
                            onClick={() => handleVMAction(vm.id, 'start')}
                            disabled={isActionLoading(vm.id)}
                            className="btn btn-success btn-sm flex items-center space-x-1"
                            title="Start VM"
                          >
                            <Play className="h-3 w-3" />
                            <span>Start</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleVMAction(vm.id, 'stop')}
                              disabled={isActionLoading(vm.id)}
                              className="btn btn-danger btn-sm flex items-center space-x-1"
                              title="Stop VM"
                            >
                              <Square className="h-3 w-3" />
                              <span>Stop</span>
                            </button>
                            <button
                              onClick={() => handleVMAction(vm.id, 'restart')}
                              disabled={isActionLoading(vm.id)}
                              className="btn btn-secondary btn-sm flex items-center space-x-1"
                              title="Restart VM"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Restart</span>
                            </button>
                            <button
                              onClick={() => handleVMAction(vm.id, 'suspend')}
                              disabled={isActionLoading(vm.id)}
                              className="btn btn-secondary btn-sm flex items-center space-x-1"
                              title="Suspend VM"
                            >
                              <Pause className="h-3 w-3" />
                              <span>Suspend</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedVMs.length > 0 && (
        <div className="card p-4 bg-vmware-50 border border-vmware-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-vmware-900">
              {selectedVMs.length} VM(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  selectedVMs.forEach(vmId => handleVMAction(vmId, 'start'));
                }}
                className="btn btn-success btn-sm flex items-center space-x-1"
              >
                <Play className="h-3 w-3" />
                <span>Start All</span>
              </button>
              <button
                onClick={() => {
                  selectedVMs.forEach(vmId => handleVMAction(vmId, 'stop'));
                }}
                className="btn btn-danger btn-sm flex items-center space-x-1"
              >
                <Square className="h-3 w-3" />
                <span>Stop All</span>
              </button>
              <button
                onClick={() => setSelectedVMs([])}
                className="btn btn-secondary btn-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VMTable;
