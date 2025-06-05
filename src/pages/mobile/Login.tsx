
import React from 'react';
import MobileLoginCard from '@/components/mobile/MobileLoginCard';

const MobileLogin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Yulu Suvidha</h1>
          <p className="text-gray-600">Employee Portal</p>
        </div>
        <MobileLoginCard />
      </div>
    </div>
  );
};

export default MobileLogin;
