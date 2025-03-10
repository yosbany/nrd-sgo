import React from 'react';

const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
    </div>
  </div>
);

export default LoadingScreen; 