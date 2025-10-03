import React from 'react';
import { useQuery } from 'react-query';
import { vmService } from '../services/vmService';
import VMTable from './VMTable';
import { 
  Server, 
  Activity, 
  HardDrive, 
  Cpu, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { data: vmsData, isLoading } = useQuery(
    'vms',
    vmService.getVMs,
    {
      refetchInterval: 30000,
    }
  );

  const vms = vmsData?.data || [];

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalVMs = vms.length;
    const runningVMs = vms.filter(vm => 
      vm.power_state?.toLowerCase() === 'powered_on' || 
      vm.power_state?.toLowerCase() === 'running'
    ).length;
    const stoppedVMs = vms.filter(vm => 
      vm.power_state?.toLowerCase() === 'powered_off' || 
      vm.power_state?.toLowerCase() === 'stopped'
    ).length;
    const suspendedVMs = vms.filter(vm => 
      vm.power_state?.toLowerCase() === 'suspended'
    ).length;
    
    const totalCPU = vms.reduce((sum, vm) => sum + (vm.cpu || 0), 0);
    const totalMemory = vms.reduce((sum, vm) => sum + (vm.memory_size || 0), 0);

    return {
      totalVMs,
      runningVMs,
      stoppedVMs,
      suspendedVMs,
      totalCPU,
      totalMemory,
    };
  }, [vms]);

  const formatMemory = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-vsphere-600">{title}</p>
          <p className="text-2xl font-bold text-vsphere-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-vsphere-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-vsphere-900">Dashboard</h1>
        <p className="text-vsphere-600 mt-2">
          Overview of your VMware ESXi infrastructure
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total VMs"
          value={stats.totalVMs}
          icon={Server}
          color="bg-vmware-500"
          subtitle="Virtual Machines"
        />
        
        <StatCard
          title="Running"
          value={stats.runningVMs}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle={`${stats.totalVMs > 0 ? ((stats.runningVMs / stats.totalVMs) * 100).toFixed(1) : 0}% of total`}
        />
        
        <StatCard
          title="Stopped"
          value={stats.stoppedVMs}
          icon={AlertTriangle}
          color="bg-red-500"
          subtitle={`${stats.totalVMs > 0 ? ((stats.stoppedVMs / stats.totalVMs) * 100).toFixed(1) : 0}% of total`}
        />
        
        <StatCard
          title="Suspended"
          value={stats.suspendedVMs}
          icon={Clock}
          color="bg-yellow-500"
          subtitle={`${stats.totalVMs > 0 ? ((stats.suspendedVMs / stats.totalVMs) * 100).toFixed(1) : 0}% of total`}
        />
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-vsphere-900">CPU Resources</h3>
            <Cpu className="h-5 w-5 text-vsphere-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-vsphere-600">Total vCPUs</span>
              <span className="font-semibold text-vsphere-900">{stats.totalCPU}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-vsphere-600">Allocated</span>
              <span className="font-semibold text-vsphere-900">{stats.totalCPU}</span>
            </div>
            <div className="w-full bg-vsphere-200 rounded-full h-2">
              <div 
                className="bg-vmware-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-vsphere-900">Memory Resources</h3>
            <HardDrive className="h-5 w-5 text-vsphere-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-vsphere-600">Total Memory</span>
              <span className="font-semibold text-vsphere-900">{formatMemory(stats.totalMemory)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-vsphere-600">Allocated</span>
              <span className="font-semibold text-vsphere-900">{formatMemory(stats.totalMemory)}</span>
            </div>
            <div className="w-full bg-vsphere-200 rounded-full h-2">
              <div 
                className="bg-vmware-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-vsphere-900">Recent Activity</h3>
          <Activity className="h-5 w-5 text-vsphere-400" />
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vmware-600"></div>
              <span className="ml-3 text-vsphere-600">Loading activity...</span>
            </div>
          ) : vms.length === 0 ? (
            <div className="text-center py-8">
              <Server className="h-12 w-12 text-vsphere-400 mx-auto mb-3" />
              <p className="text-vsphere-600">No virtual machines found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vms.slice(0, 5).map((vm) => (
                <div key={vm.id} className="flex items-center justify-between py-2 px-3 bg-vsphere-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Server className="h-4 w-4 text-vsphere-400" />
                    <span className="text-sm font-medium text-vsphere-900">{vm.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      vm.power_state?.toLowerCase() === 'powered_on' || vm.power_state?.toLowerCase() === 'running'
                        ? 'status-running'
                        : vm.power_state?.toLowerCase() === 'powered_off' || vm.power_state?.toLowerCase() === 'stopped'
                        ? 'status-stopped'
                        : 'status-suspended'
                    }`}>
                      {vm.power_state || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Virtual Machines Table */}
      <div>
        <VMTable />
      </div>
    </div>
  );
};

export default Dashboard;
