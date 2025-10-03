import React from 'react';
import { useQuery } from 'react-query';
import { hostService } from '../services/hostService';
import { 
  Server, 
  Activity, 
  HardDrive, 
  Network, 
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

// Mock data for demonstration - replace with actual API calls
const mockServicesData = {
  services: [
    {
      key: 'vpxa',
      name: 'VMware vCenter Agent',
      state: 'running',
      startup_type: 'automatic',
      description: 'VMware vCenter Agent service',
      health: 'healthy'
    },
    {
      key: 'hostd',
      name: 'VMware Host Agent',
      state: 'running',
      startup_type: 'automatic',
      description: 'VMware Host Agent service',
      health: 'healthy'
    },
    {
      key: 'vmtoolsd',
      name: 'VMware Tools',
      state: 'running',
      startup_type: 'automatic',
      description: 'VMware Tools service',
      health: 'healthy'
    },
    {
      key: 'ntpd',
      name: 'Network Time Protocol',
      state: 'running',
      startup_type: 'automatic',
      description: 'NTP daemon for time synchronization',
      health: 'healthy'
    },
    {
      key: 'sshd',
      name: 'SSH Daemon',
      state: 'running',
      startup_type: 'automatic',
      description: 'Secure Shell daemon',
      health: 'healthy'
    },
    {
      key: 'dcbd',
      name: 'Data Center Bridge',
      state: 'stopped',
      startup_type: 'manual',
      description: 'Data Center Bridge daemon',
      health: 'unknown'
    }
  ],
  count: 6
};

const mockHostData = {
  hosts: [
    {
      host: 'host-1',
      name: 'ESXi-192.168.159.128',
      connection_state: 'CONNECTED',
      power_state: 'POWERED_ON',
      boot_time: '2025-01-10T10:30:00Z',
      hardware: {
        cpu_model: 'Intel Xeon E5-2620',
        cpu_cores: 8,
        memory_total: 32768
      },
      cpu: {
        count: 8,
        cores_per_socket: 4
      },
      memory: {
        size_MiB: 32768
      }
    }
  ],
  count: 1
};

const mockStorageData = {
  datastores: [
    {
      datastore: 'datastore-1',
      name: 'datastore1',
      type: 'VMFS',
      accessible: true,
      capacity: 1073741824000, // 1TB in bytes
      free_space: 536870912000, // 500GB in bytes
      used_space: 536870912000,
      utilization_percent: '50.00'
    },
    {
      datastore: 'datastore-2',
      name: 'datastore2',
      type: 'NFS',
      accessible: true,
      capacity: 2147483648000, // 2TB in bytes
      free_space: 1073741824000, // 1TB in bytes
      used_space: 1073741824000,
      utilization_percent: '50.00'
    }
  ],
  count: 2
};

const mockNetworkingData = {
  networks: [
    {
      network: 'network-1',
      name: 'VM Network',
      type: 'STANDARD_PORTGROUP',
      accessible: true
    },
    {
      network: 'network-2',
      name: 'Management Network',
      type: 'STANDARD_PORTGROUP',
      accessible: true
    }
  ],
  count: 2
};

const Services = () => {
  // API calls - try real API first, fallback to mock data
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery(
    'services',
    async () => {
      try {
        return await hostService.getServices();
      } catch (error) {
        console.warn('Using mock services data due to API error:', error);
        return mockServicesData;
      }
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: hostData, isLoading: hostLoading, error: hostError } = useQuery(
    'hostInfo',
    async () => {
      try {
        return await hostService.getHostInfo();
      } catch (error) {
        console.warn('Using mock host data due to API error:', error);
        return mockHostData;
      }
    },
    {
      refetchInterval: 30000,
    }
  );

  const { data: storageData, isLoading: storageLoading, error: storageError } = useQuery(
    'storageInfo',
    async () => {
      try {
        return await hostService.getStorageInfo();
      } catch (error) {
        console.warn('Using mock storage data due to API error:', error);
        return mockStorageData;
      }
    },
    {
      refetchInterval: 30000,
    }
  );

  const { data: networkingData, isLoading: networkingLoading, error: networkingError } = useQuery(
    'networkingInfo',
    async () => {
      try {
        return await hostService.getNetworkingInfo();
      } catch (error) {
        console.warn('Using mock networking data due to API error:', error);
        return mockNetworkingData;
      }
    },
    {
      refetchInterval: 30000,
    }
  );

  const getServiceStatusIcon = (state) => {
    switch (state) {
      case 'running':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'stopped':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getServiceStatusColor = (state) => {
    switch (state) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ESXi Services</h1>
              <p className="text-gray-600">Monitor and manage ESXi host services</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Host Information */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Host Information</h3>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
            </div>
            
            {hostLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vmware-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading host information...</p>
              </div>
            ) : hostError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load host information</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hostData?.hosts?.map((host) => (
                  <div key={host.host} className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{host.name}</h4>
                      <p className="text-sm text-gray-500">Host ID: {host.host}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          host.connection_state === 'CONNECTED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {host.connection_state}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Power:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          host.power_state === 'POWERED_ON' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {host.power_state}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">CPU:</span>
                        <span className="text-sm text-gray-900">{host.cpu?.count || 0} cores</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Memory:</span>
                        <span className="text-sm text-gray-900">{Math.round((host.memory?.size_MiB || 0) / 1024)} GB</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Boot Time:</span>
                        <span className="text-sm text-gray-900">{formatDate(host.boot_time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Services</h3>
              <span className="text-sm text-gray-500">
                {servicesData?.count || 0} services
              </span>
            </div>
            
            {servicesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vmware-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading services...</p>
              </div>
            ) : servicesError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load services</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Startup Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Health
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {servicesData?.services?.map((service) => (
                      <tr key={service.key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Settings className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{service.name}</div>
                              <div className="text-sm text-gray-500">{service.key}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getServiceStatusIcon(service.state)}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusColor(service.state)}`}>
                              {service.state}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.startup_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.health === 'healthy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {service.health}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {service.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Storage and Networking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Storage */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Storage</h3>
              <HardDrive className="h-5 w-5 text-gray-400" />
            </div>
            
            {storageLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vmware-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading storage...</p>
              </div>
            ) : storageError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load storage</p>
              </div>
            ) : (
              <div className="space-y-4">
                {storageData?.datastores?.map((ds) => (
                  <div key={ds.datastore} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{ds.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ds.accessible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ds.type}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="text-gray-900">{formatBytes(ds.capacity)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Used:</span>
                        <span className="text-gray-900">{formatBytes(ds.used_space)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Free:</span>
                        <span className="text-gray-900">{formatBytes(ds.free_space)}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-vmware-600 h-2 rounded-full" 
                          style={{ width: `${ds.utilization_percent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {ds.utilization_percent}% utilized
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Networking */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Networking</h3>
              <Network className="h-5 w-5 text-gray-400" />
            </div>
            
            {networkingLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vmware-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading networks...</p>
              </div>
            ) : networkingError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load networks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {networkingData?.networks?.map((network) => (
                  <div key={network.network} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{network.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        network.accessible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {network.accessible ? 'Accessible' : 'Inaccessible'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-900">{network.type}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Network ID:</span>
                        <span className="text-gray-900 font-mono text-xs">{network.network}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
