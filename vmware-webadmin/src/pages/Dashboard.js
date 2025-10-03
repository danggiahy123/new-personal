import React from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Monitor, 
  Activity, 
  TrendingUp,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { vmService } from '../services/vmService';
import { hostService } from '../services/hostService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { data: statsData } = useQuery('admin-stats', adminService.getStats);
  const { data: vmsData } = useQuery('vms', vmService.getVMs);
  const { data: hostData } = useQuery('host-info', hostService.getHostInfo);

  const stats = statsData?.stats;
  const vms = vmsData?.vms || [];
  const hosts = hostData?.hosts || [];

  const actionChartData = stats?.actions?.map(action => ({
    name: action._id,
    count: action.count,
    success: action.success,
    failed: action.failed
  })) || [];

  const vmStatusData = [
    { name: 'Running', value: vms.filter(vm => vm.power_state === 'poweredOn' || vm.power_state === 'POWERED_ON').length, color: '#10B981' },
    { name: 'Stopped', value: vms.filter(vm => vm.power_state === 'poweredOff' || vm.power_state === 'POWERED_OFF').length, color: '#EF4444' },
    { name: 'Suspended', value: vms.filter(vm => vm.power_state === 'suspended' || vm.power_state === 'SUSPENDED').length, color: '#F59E0B' },
  ];

  const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

  const recentLogs = stats?.topUsers?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your VMware ESXi management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.users?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-500">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total VMs</p>
              <p className="text-2xl font-semibold text-gray-900">{vms.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-500">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Actions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.logs?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.logs?.total > 0 
                  ? Math.round((stats.logs.successful / stats.logs.total) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Action Statistics */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Action Statistics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#10B981" name="Successful" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VM Status Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">VM Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vmStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vmStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Users */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((user, index) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">
                        {user.successfulActions} successful, {user.failedActions} failed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.totalActions}</p>
                    <p className="text-xs text-gray-500">total actions</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No activity data available</p>
            )}
          </div>
        </div>

        {/* ESXi Host Status */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ESXi Host Status</h3>
          <div className="space-y-4">
            {hosts.length > 0 ? (
              hosts.map((host, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Server className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-500">Host Name</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{host.name}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-500">Connection State</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-600">{host.connection_state}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Monitor className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-500">Power State</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-600">{host.power_state}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-500">Boot Time</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {host.boot_time ? new Date(host.boot_time).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-500">ESXi Host</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-500">API Status</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Monitor className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-500">Total VMs</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{vms.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
