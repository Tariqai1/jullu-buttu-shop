import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBoxOpen, FaTags, FaBell } from 'react-icons/fa';

// API URL ko .env file se import karna
const API_URL = import.meta.env.VITE_API_BASE_URL;

function AdminDashboard() {
  const [stats, setStats] = useState({ covers: 0, categories: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  // Page load par saare stats fetch karein
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Hum teeno API calls ek saath (parallel) bhejenge
        const [coversRes, categoriesRes, notificationsRes] = await Promise.all([
          axios.get(`${API_URL}/covers`), // Yeh "model=" ke bina saare covers layega
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/notify`)
        ]);

        setStats({
          covers: coversRes.data.length,
          categories: categoriesRes.data.length,
          notifications: notificationsRes.data.length
        });
        
      } catch (err) {
        console.error("Stats fetch karne mein error:", err);
        // Error hone par default stats dikhayein
        setStats({ covers: 'N/A', categories: 'N/A', notifications: 'N/A' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Covers Card */}
        <StatCard
          icon={<FaBoxOpen className="text-blue-500" />}
          label="Total Covers"
          value={stats.covers}
          loading={loading}
        />
        
        {/* Total Categories Card */}
        <StatCard
          icon={<FaTags className="text-green-500" />}
          label="Total Categories"
          value={stats.categories}
          loading={loading}
        />
        
        {/* Pending Pre-Orders Card */}
        <StatCard
          icon={<FaBell className="text-red-500" />}
          label="Pending Pre-Orders"
          value={stats.notifications}
          loading={loading}
        />
      </div>

      {/* Welcome Message */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Welcome, Admin!</h2>
        <p className="text-gray-700">Yahaan se aap naye products upload kar sakte hain, categories manage kar sakte hain, aur pending pre-orders dekh sakte hain.</p>
        <p className="text-gray-700 mt-2">Shuru karne ke liye, left sidebar se ek option chunein.</p>
      </div>
    </div>
  );
}

// Stats Card ke liye ek chhota component
function StatCard({ icon, label, value, loading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
      <div className="text-4xl p-3 bg-gray-100 rounded-full">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">{label}</h2>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

