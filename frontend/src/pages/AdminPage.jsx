import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaUpload, FaTags, FaBell, FaEdit, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Lazy Loading
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const AdminUpload = lazy(() => import('../components/admin/AdminUpload'));
const AdminCategories = lazy(() => import('../components/admin/AdminCategories'));
const AdminNotifications = lazy(() => import('../components/admin/AdminNotifications'));
const AdminManageProducts = lazy(() => import('../components/admin/AdminManageProducts'));

// Loading fallback component
function AdminLoading() {
  return (
    <div className="flex justify-center items-center h-full">
      <FaSpinner className="animate-spin text-4xl text-blue-600" />
    </div>
  );
}

function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Tabs ko render karne ke liye helper
  const renderTabContent = () => {
    // Hum har component ko 'activeTab' prop pass karenge.
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard activeTab={activeTab} />;
      case 'upload':
        return <AdminUpload activeTab={activeTab} />;
      case 'categories':
        return <AdminCategories activeTab={activeTab} />;
      case 'notifications':
        return <AdminNotifications activeTab={activeTab} />;
      case 'manage':
        return <AdminManageProducts activeTab={activeTab} />;
      default:
        return <AdminDashboard activeTab={activeTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="text-center py-6">
          <Link to="/" className="text-2xl font-bold">Jullu Buttu</Link>
          <span className="block text-sm text-gray-400">Admin Panel</span>
        </div>
        <nav className="flex-grow">
          <ul>
            <AdminSidebarButton
              icon={<FaTachometerAlt />}
              label="Dashboard"
              onClick={() => setActiveTab('dashboard')}
              active={activeTab === 'dashboard'}
            />
            <AdminSidebarButton
              icon={<FaEdit />}
              label="Manage Products"
              onClick={() => setActiveTab('manage')}
              active={activeTab === 'manage'}
            />
            <AdminSidebarButton
              icon={<FaUpload />}
              label="Upload New"
              onClick={() => setActiveTab('upload')}
              active={activeTab === 'upload'}
            />
            <AdminSidebarButton
              icon={<FaTags />}
              label="Manage Categories"
              onClick={() => setActiveTab('categories')}
              active={activeTab === 'categories'}
            />
            <AdminSidebarButton
              icon={<FaBell />}
              label="Pre-Orders"
              onClick={() => setActiveTab('notifications')}
              active={activeTab === 'notifications'}
            />
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link to="/" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4h.01M12 12h.01M15 12h.01M12 9h.01M15 9h.01M9 9h.01"></path></svg>
            <span>Go to Shop</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <Suspense fallback={<AdminLoading />}>
          {renderTabContent()}
        </Suspense>
      </main>
    </div>
  );
}

// Sidebar Button ke liye ek chhota component
function AdminSidebarButton({ icon, label, onClick, active }) {
  return (
    <li className="mb-2">
      <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-6 py-3 transition-colors ${
          active
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        {icon}
        <span className="font-medium">{label}</span>
      </button>
    </li>
  );
}

export default AdminPage;