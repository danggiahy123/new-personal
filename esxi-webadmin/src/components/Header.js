import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="vmware-header px-6 py-4 shadow-vsphere">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">ESXi Management Console</h1>
          <div className="hidden md:flex items-center space-x-2 text-vmware-100">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">Connected</span>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-vmware-100 hover:text-white hover:bg-vmware-700 rounded-md transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* Settings */}
          <button className="p-2 text-vmware-100 hover:text-white hover:bg-vmware-700 rounded-md transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-vmware-100">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.username || 'Admin'}</span>
            </div>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-vmware-100 hover:text-white hover:bg-vmware-700 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
