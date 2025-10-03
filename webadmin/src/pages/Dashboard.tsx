import React from 'react';
import { useQuery } from 'react-query';
import { Users, Package, TrendingUp, Activity } from 'lucide-react';
import { userService } from '../services/userService';
import { productService } from '../services/productService';

const Dashboard: React.FC = () => {
  const { data: usersData } = useQuery('users', userService.getUsers);
  const { data: productsData } = useQuery('products', () => productService.getProducts({ limit: 10 }));

  const stats = [
    {
      name: 'Total Users',
      value: usersData?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Products',
      value: productsData?.total || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Active Users',
      value: usersData?.users?.filter((user: any) => user.isActive).length || 0,
      icon: Activity,
      color: 'bg-yellow-500',
    },
    {
      name: 'Growth Rate',
      value: '+12%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  const recentUsers = usersData?.users?.slice(0, 5) || [];
  const recentProducts = productsData?.products?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Products</h3>
          <div className="space-y-3">
            {recentProducts.length > 0 ? (
              recentProducts.map((product: any) => (
                <div key={product._id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Package className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      ${product.price}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No products found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
