import React from 'react';
import { FaSearch } from 'react-icons/fa'; // Search icon ke liye

function SearchBar({ onSearchChange }) {
  return (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        Apna Perfect Cover Dhoondein
      </h2>
      <div className="flex justify-center w-full max-w-lg mx-auto relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
          <FaSearch />
        </span>
        <input
          type="text"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="e.g., iPhone 14, Samsung A15..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export default SearchBar;
