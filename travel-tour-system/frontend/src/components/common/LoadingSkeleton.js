import React from 'react';

const LoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
