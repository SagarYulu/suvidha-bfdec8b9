
import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <p className="text-center text-gray-500 mb-4">
          Please implement this login page or use the admin login at 
          <a href="/admin/login" className="text-blue-500 hover:underline ml-1">
            /admin/login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
