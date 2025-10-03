import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Lock, Server } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    esxiUsername: '',
    esxiPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    esxiPassword: false,
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.esxiUsername || !formData.esxiPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await login(
      formData.username,
      formData.password,
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vmware-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-vmware-600 rounded-full flex items-center justify-center">
            <Server className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            VMware ESXi Management
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your virtual machines
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Application Login */}
            <div className="bg-white p-6 rounded-lg shadow-soft border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-vmware-600" />
                Application Login
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Enter your username"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPasswords.password ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input pl-10 pr-10"
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      {showPasswords.password ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ESXi Login */}
            <div className="bg-white p-6 rounded-lg shadow-soft border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Server className="h-5 w-5 mr-2 text-vmware-600" />
                ESXi Credentials
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="esxiUsername" className="block text-sm font-medium text-gray-700">
                    ESXi Username
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
                    ESXi Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="esxiPassword"
                      name="esxiPassword"
                      type={showPasswords.esxiPassword ? 'text' : 'password'}
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
                      onClick={() => togglePasswordVisibility('esxiPassword')}
                    >
                      {showPasswords.esxiPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full py-3 text-lg"
            >
              Sign In
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ESXi Host: <span className="font-mono text-vmware-600">192.168.159.128</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
