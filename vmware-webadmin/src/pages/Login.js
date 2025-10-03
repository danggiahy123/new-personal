import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Lock, Server, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    esxiUsername: 'root',
    esxiPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.esxiUsername || !formData.esxiPassword) {
      toast.error('Please enter ESXi credentials');
      return;
    }

    const result = await login(
      'admin', // Fixed admin username
      'password', // Fixed admin password
      formData.esxiUsername,
      formData.esxiPassword
    );

    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vmware-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-vmware-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ESXi Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Administrative access to VMware ESXi management system
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow-soft border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Server className="h-5 w-5 mr-2 text-vmware-600" />
              ESXi Login
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="esxiUsername" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1 relative">
                  <input
                    id="esxiUsername"
                    name="esxiUsername"
                    type="text"
                    required
                    value={formData.esxiUsername}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter ESXi username"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="esxiPassword" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="esxiPassword"
                    name="esxiPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.esxiPassword}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="Enter ESXi password"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full py-3 text-lg"
            >
              Sign In to Admin Portal
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ESXi Host: <span className="font-mono text-vmware-600">192.168.159.128</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Enter your ESXi root credentials to access the management portal
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
