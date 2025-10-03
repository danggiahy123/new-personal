import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  Activity, 
  HardDrive, 
  Network, 
  Users, 
  Settings,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Virtual Machines', href: '/vms', icon: Server },
    { name: 'Performance', href: '/performance', icon: Activity },
    { name: 'Storage', href: '/storage', icon: HardDrive },
    { name: 'Network', href: '/network', icon: Network },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="vmware-sidebar w-64 min-h-screen shadow-vsphere-lg">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-vmware-500 rounded-md flex items-center justify-center">
            <Server className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">ESXi Admin</h2>
            <p className="text-xs text-vsphere-300">Management Console</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-vmware-500 text-white'
                      : 'text-vsphere-300 hover:text-white hover:bg-vsphere-700'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Status Section */}
        <div className="mt-8 pt-6 border-t border-vsphere-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-vsphere-300">ESXi Host</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400">Online</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-vsphere-300">API Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-vsphere-300">Session</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
