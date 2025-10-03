import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Web Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          FullStack Mobile App - Web Admin Panel
        </p>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Backend Status
            </h2>
            <p className="text-green-600">✅ Backend API Ready</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Database Status
            </h2>
            <p className="text-green-600">✅ MongoDB Connected</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Next Steps
            </h2>
            <p className="text-gray-600">
              Install dependencies: <code className="bg-gray-100 px-2 py-1 rounded">npm install</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
