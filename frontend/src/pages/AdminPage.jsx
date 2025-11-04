import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
// Naye icons (Hamburger aur Close)
import { FaTachometerAlt, FaUpload, FaTags, FaBell, FaEdit, FaSpinner, FaBars } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion'; // Animation ke liye

// --- Lazy Loading (Yeh pehle jaisa hi hai) ---
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
  
  // --- NAYA "BEHTREEN" (AWESOME) STATE ---
  // Mobile sidebar ko kholne/band karne ke liye
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // --- END OF NAYA STATE ---

  // Tabs ko render karne ke liye helper
  const renderTabContent = () => {
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

  // --- NAYA "BEHTREEN" (AWESOME) SIDEBAR COMPONENT ---
  // Humne sidebar ko ek naya component bana diya hai taaki code saaf rahe
  const SidebarContent = () => (
    <>
      <div className="text-center py-6">
        <Link to="/" className="text-2xl font-bold">Jullu Buttu</Link>
        <span className="block text-sm text-gray-400">Admin Panel</span>
      </div>
      <nav className="flex-grow">
        <ul>
          <AdminSidebarButton
            icon={<FaTachometerAlt />}
            label="Dashboard"
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} // Mobile par band karein
            active={activeTab === 'dashboard'}
          />
          <AdminSidebarButton
            icon={<FaEdit />}
            label="Manage Products"
            onClick={() => { setActiveTab('manage'); setIsSidebarOpen(false); }} // Mobile par band karein
            active={activeTab === 'manage'}
          />
          <AdminSidebarButton
            icon={<FaUpload />}
            label="Upload New"
            onClick={() => { setActiveTab('upload'); setIsSidebarOpen(false); }} // Mobile par band karein
            active={activeTab === 'upload'}
          />
          <AdminSidebarButton
            icon={<FaTags />}
            label="Manage Categories"
            onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }} // Mobile par band karein
            active={activeTab === 'categories'}
          />
          <AdminSidebarButton
            icon={<FaBell />}
            label="Pre-Orders"
            onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }} // Mobile par band karein
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
    </>
  );
  // --- END OF NAYA COMPONENT ---

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* --- NAYA "BEHTREEN" (AWESOME) MOBILE SIDEBAR --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)} // Bahar click karne par band karein
            />
            {/* Sidebar Menu */}
            <motion.aside
              className="fixed top-0 left-0 w-64 h-full bg-gray-800 text-white flex flex-col z-40 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {/* --- END OF MOBILE SIDEBAR --- */}

      {/* --- Desktop Sidebar --- */}
      {/* Yeh mobile par 'hidden' rahega */}
      <aside className="w-64 bg-gray-800 text-white flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col">
        
        {/* --- NAYA "BEHTREEN" (AWESOME) TOP BAR (with Hamburger) --- */}
        <header className="md:hidden bg-white shadow-md p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2"
          >
            <FaBars className="text-xl text-gray-700" />
          </button>
          <span className="text-lg font-bold text-gray-800">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          <Link to="/" className="text-xl text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4h.01M12 12h.01M15 12h.01M12 9h.01M15 9h.01M9 9h.01"></path></svg>
          </Link>
        </header>
        {/* --- END OF TOP BAR --- */}
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Suspense fallback={<AdminLoading />}>
            {renderTabContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Sidebar Button ke liye ek chhota component
function AdminSidebarButton({ icon, label, onClick, active }) {
  return (
    <li className="mb-2 px-4">
      <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
          active
            ? 'bg-blue-600 text-white shadow-md'
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

