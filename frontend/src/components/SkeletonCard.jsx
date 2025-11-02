import React from 'react';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Hum Tailwind ki 'animate-pulse' utility ka istemal karenge shimmer effect ke liye */}
      <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;

