
import React from 'react';

const LoginScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p>This is a minimal login screen.</p>
      </div>
    </div>
  );
};

export default LoginScreen;
