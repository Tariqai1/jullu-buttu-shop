import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBoxOpen, FaTags, FaBell, FaSpinner } from 'react-icons/fa';
// "Behtreen" (Awesome) Chart library import karein
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// API URL ko .env file se import karna
const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- "BEHTREEN" (AWESOME) 100% FIX (Redirect Error) ---
// Humne URL ke aakhir se "/" (slash) HATA diya hai
// Taaki yeh Python backend se 100% match kare
const COVERS_API_URL = `${API_URL}/covers`;
const CATEGORIES_API_URL = `${API_URL}/categories`;
const NOTIFY_API_URL = `${API_URL}/notify`;
// --- END OF FIX ---

// Helper function: Date ko format karne ke liye
const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) { return 'Invalid Date'; }
};

// Main Dashboard Component
function AdminDashboard({ activeTab }) {
  const [stats, setStats] = useState({ covers: 0, categories: 0, notifications: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- "BEHTREEN" (AWESOME) DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // --- "BEHTREEN" (AWESOME) 100% FIX (Params + Cache) ---
      // 1. Covers config (admin_mode ke saath)
      const coversConfig = {
        params: { admin_mode: true }, // admin_mode ko params mein bhejein
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      };
      
      // 2. Normal config (baaki calls ke liye)
      const config = {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      };
      // --- END OF FIX ---

      // Teeno API calls ek saath (parallel) bhejenge
      const [coversRes, categoriesRes, notificationsRes] = await Promise.all([
        // --- "BEHTREEN" (AWESOME) 100% FIX ---
        // Humne URL se '?admin_mode=true' hata diya aur 'coversConfig' pass kiya
        axios.get(COVERS_API_URL, coversConfig), 
        axios.get(CATEGORIES_API_URL, config),
        axios.get(NOTIFY_API_URL, config)
        // --- END OF FIX ---
      ]);
      
      const allProducts = coversRes.data;
      const allNotifications = notificationsRes.data;

      // 1. Stats set karein
      setStats({
        covers: allProducts.length,
        categories: categoriesRes.data.length,
        notifications: allNotifications.filter(n => n.status === 'Pending').length // Sirf 'Pending' count karein
      });

      // 2. "Behtreen" (Awesome) Chart Data: Stock < 10 wale products
      const lowStock = allProducts
        .filter(p => p.stock < 10)
        .sort((a, b) => a.stock - b.stock) // Sabse kam stock wale pehle
        .slice(0, 5); // Sirf top 5
      setLowStockProducts(lowStock);
      
      // 3. "Behtreen" (Awesome) Recent Orders Data
      setRecentNotifications(allNotifications.slice(0, 5)); // Naye 5

    } catch (err) {
      console.error("Stats fetch karne mein error:", err);
      setStats({ covers: 'N/A', categories: 'N/A', notifications: 'N/A' });
    } finally {
      setLoading(false);
    }
  };
  
  // Jab yeh tab active ho, tab data fetch karein
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchData();
    }
  }, [activeTab]);
  // --- END OF DATA FETCHING ---

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<FaBoxOpen className="text-blue-500" />}
          label="Total Products"
          value={stats.covers}
          loading={loading}
        />
        <StatCard
          icon={<FaTags className="text-green-500" />}
          label="Total Categories"
          value={stats.categories}
          loading={loading}
        />
        <StatCard
          icon={<FaBell className="text-red-500" />}
          label="Pending Pre-Orders"
          value={stats.notifications}
          loading={loading}
        />
      </div>

      {/* --- NAYA "BEHTREEN SE BEHTREEN" (AWESOME) LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* 1. Low Stock Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Low Stock Items (Top 5)</h2>
          {loading ? (
            <AdminLoading />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lowStockProducts} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <XAxis dataKey="modelName" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#ef4444" name="Stock Available" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 2. Recent Pre-Orders List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Recent Pre-Orders (Top 5)</h2>
          {loading ? (
            <AdminLoading />
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentNotifications.length === 0 && <p>Koi recent orders nahi hain.</p>}
              {recentNotifications.map(noti => (
                <li key={noti.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{noti.modelName}</p>
                    <p className="text-sm text-gray-500">{noti.phone} - {formatDate(noti.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    noti.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 
                    noti.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    noti.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {noti.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
      {/* --- END OF NAYA LAYOUT --- */}
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

// Loading component
function AdminLoading() {
  return (
    <div className="flex justify-center items-center h-full py-10">
      <FaSpinner className="animate-spin text-3xl text-blue-600" />
    </div>
  );
}

export default AdminDashboard;

