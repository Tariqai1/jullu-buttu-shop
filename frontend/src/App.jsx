import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Pages
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage'; // Naya Login page import karein

// Components
import OrderModal from './components/OrderModal';
import Toast from './components/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Naya "Secure" component (hum ise agle step mein banayenge)

// API URL ko .env file se import karna
const API_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [modal, setModal] = useState({ show: false, modelName: '' });
  const [toast, setToast] = useState({ show: false, message: '' });

  // --- Modal Handlers ---
  const handleOrderNow = (modelName = '') => {
    setModal({ show: true, modelName: modelName });
  };
  const handleCloseModal = () => setModal({ show: false, modelName: '' });
  
  const handleOrderSubmit = async (phone, modelName) => {
    try {
      await axios.post(`${API_URL}/notify`, { phone, modelName });
      handleCloseModal();
      setToast({ show: true, message: "Request save ho gayi!" });
    } catch (err) {
      console.error("Order Submit Error:", err);
      alert("Request submit nahi ho paayi. Server se connect nahi ho pa raha.");
    }
  };

  // --- Toast Handler ---
  const hideToast = () => setToast({ show: false, message: '' });

  return (
    <>
      <Routes>
        {/* Homepage Route (User Shop) */}
        <Route path="/" element={<HomePage onOrderNow={handleOrderNow} />} />
        
        {/* --- NAYA "BEHTREEN" (AWESOME) SECURITY --- */}
        
        {/* 1. Login Page Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 2. Secure Admin Panel Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        {/* --- END OF SECURITY --- */}
        
      </Routes>

      {/* Global Modal aur Toast */}
      <OrderModal 
        show={modal.show}
        modelName={modal.modelName} 
        onClose={handleCloseModal} 
        onSubmit={handleOrderSubmit}
      />
      
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onHide={hideToast} 
      />
    </>
  );
}

export default App;

