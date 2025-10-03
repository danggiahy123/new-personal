import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vmService } from '../services/vmService';
import { 
  Server, 
  Play, 
  Square, 
  RefreshCw, 
  Monitor, 
  Cpu, 
  HardDrive,
  Activity,
  Users,
  Clock,
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: vmsData, isLoading, error } = useQuery(
    'vms',
    vmService.getVMs,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const vms = vmsData?.vms || [];
  const runningVMs = vms.filter(vm => vm.power_state === 'POWERED_ON');
  const stoppedVMs = vms.filter(vm => vm.power_state === 'POWERED_OFF');
  const totalCPU = vms.reduce((sum, vm) => sum + (vm.cpu_count || 0), 0);
  const totalMemory = vms.reduce((sum, vm) => sum + (vm.memory_size_mb || 0), 0);

  const stats = [
    {
      name: 'Total VMs',
      value: vms.length,
      icon: Monitor,
      color: 'bg-blue-500',
    },
    {
      name: 'Running VMs',
      value: runningVMs.length,
      icon: Play,
      color: 'bg-green-500',
    },
    {
      name: 'Stopped VMs',
      value: stoppedVMs.length,
      icon: Square,
      color: 'bg-red-500',
    },
    {
      name: 'Total CPU Cores',
      value: totalCPU,
      icon: Cpu,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Memory',
      value: `${Math.round(totalMemory / 1024)} GB`,
      icon: HardDrive,
      color: 'bg-yellow-500',
    },
    {
      name: 'ESXi Status',
      value: 'Connected',
      icon: Activity,
      color: 'bg-green-500',
    },
  ];

  const recentVMs = vms.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/vms')}
                className="btn btn-primary mr-2"
              >
                <Monitor className="h-4 w-4 mr-2" />
                View All VMs
              </button>
              <button
                onClick={() => navigate('/services')}
                className="btn btn-secondary"
              >
                <Settings className="h-4 w-4 mr-2" />
                Services
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="card p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent VMs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent VMs</h3>
              <button
                onClick={() => navigate('/vms')}
                className="text-sm text-vmware-600 hover:text-vmware-700"
              >
                View all
              </button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vmware-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading VMs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load VMs</p>
              </div>
            ) : recentVMs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No VMs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVMs.map((vm) => (
                  <div
                    key={vm.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/vms/${vm.id}`)}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        vm.power_state === 'POWERED_ON' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vm.name}</p>
                        <p className="text-xs text-gray-500">
                          {vm.cpu_count} CPU • {Math.round(vm.memory_size_mb / 1024)} GB RAM
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs px-2 py-1 rounded-full ${
                        vm.power_state === 'POWERED_ON' 
                          ? 'status-running' 
                          : 'status-stopped'
                      }`}>
                        {vm.power_state === 'POWERED_ON' ? 'Running' : 'Stopped'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/vms')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Monitor className="h-5 w-5 text-vmware-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Manage VMs</p>
                  <p className="text-xs text-gray-500">View and control all virtual machines</p>
                </div>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-vmware-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Refresh Data</p>
                  <p className="text-xs text-gray-500">Update VM status and information</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Server className="h-5 w-5 text-vmware-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">ESXi Host</p>
                <p className="text-xs text-gray-500">192.168.159.128</p>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-vmware-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">User</p>
                <p className="text-xs text-gray-500">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-vmware-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
