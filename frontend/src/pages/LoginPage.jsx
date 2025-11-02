import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa';
import logo from '../assets/logo.png'; // Logo import karein

// API URL ko .env file se import karna
const API_URL = import.meta.env.VITE_API_BASE_URL;

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Redirect karne ke liye

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Backend ko login request bhejein
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: username,
        password: password
      });

      // --- "BEHTREEN" (AWESOME) SECURITY ---
      // Agar login successful hai, to 'token' (ya username) ko localStorage mein save karein
      // Taaki hum user ko logged in rakh sakein
      localStorage.setItem('adminUser', JSON.stringify(response.data));
      // --- END OF SECURITY ---

      setLoading(false);
      
      // Admin panel par redirect karein
      navigate('/admin');

    } catch (err) {
      setLoading(false);
      if (err.response && err.response.status === 401) {
        setError('Galat username ya password.');
      } else {
        setError('Login fail ho gaya. Server se connect nahi ho pa raha.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        
        {/* Logo aur Shop ka Naam */}
        <Link to="/" className="flex justify-center items-center mb-6 text-3xl font-extrabold text-gray-900 group">
          <img 
            src={logo} 
            alt="Jullu Buttu Logo"
            className="mr-3 h-12 w-12" // Thoda chhota logo
          />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Jullu Buttu Admin
          </span>
        </Link>
        
        {/* Login Form */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-8 rounded-2xl shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md mb-4 bg-red-100 text-red-700 text-center">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-400"
          >
            {loading ? (
              <FaUserShield className="animate-spin" /> // Placeholder icon
            ) : (
              <FaUserShield />
            )}
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            Sirf authorized admin hi login kar sakte hain.
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
