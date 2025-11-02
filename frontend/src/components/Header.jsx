import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRegUser, FaBars, FaShoppingCart, FaShareAlt } from 'react-icons/fa';
import logo from '../assets/logo.png';

function Header({ onOrderNowClick, onFilterToggle }) {
  const [copySuccess, setCopySuccess] = useState('');

  const handleShare = () => {
    const urlToCopy = window.location.origin;
    const textArea = document.createElement('textarea');
    textArea.value = urlToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo (Jullu Buttu) */}
        <Link to="/" className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center group">
          <img 
            src={logo} 
            alt="Jullu Buttu Logo"
            className="mr-3 h-12 w-12 md:h-14 md:w-14 transition-transform duration-300 group-hover:rotate-[-10deg]" 
          />
          {/* Mobile par "Jullu Buttu" chhota dikhega */}
          <span className="text-2xl sm:text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:from-blue-500 group-hover:to-purple-500 tracking-tight">
            Jullu Buttu
          </span>
          {/* Desktop par poora naam dikhega */}
          <span className="hidden sm:inline ml-2 text-2xl sm:text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:from-blue-500 group-hover:to-purple-500 tracking-tight">
             Mobile Shope
          </span>
        </Link>

        {/* --- "BEHTREEN SE BEHTREEN" (AWESOME) HEADER MENU --- */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* 1. Order Now Button (Mobile + Desktop) */}
          <button
            onClick={() => onOrderNowClick()}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all"
          >
            <FaShoppingCart />
            {/* Mobile par "Custom Order" text chhip jayega */}
            <span className="hidden sm:inline">Custom Order</span>
          </button>
          
          {/* 2. Share Button (Mobile + Desktop) */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-md hover:bg-blue-200 transition-all"
          >
            <FaShareAlt />
            {/* Mobile par text chhip jayega */}
            <span className="hidden sm:inline">
              {copySuccess || 'Share'}
            </span>
          </button>
          
          {/* 3. Filter Toggle Button (Sirf mobile par dikhega) */}
          <button
            onClick={onFilterToggle}
            className="sm:hidden p-2 text-gray-700 text-2xl"
            aria-label="Toggle Filters"
          >
            <FaBars />
          </button>

        </div>
        {/* --- END OF NAYA MENU --- */}

      </nav>
    </header>
  );
}

export default Header;

