import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const location = useLocation();

  // --- "BEHTREEN" (AWESOME) SECURITY CHECK ---
  // Check karein ki localStorage mein 'adminUser' save hai ya nahi
  const user = localStorage.getItem('adminUser');
  // --- END OF SECURITY CHECK ---

  if (!user) {
    // Agar user logged in nahi hai, to use login page par bhej dein
    // 'replace' ka matlab hai ki user "back" button daba kar waapas admin panel par nahi aa sakta
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Agar user logged in hai, to use woh page (AdminPage) dikhayein jo usne maanga tha
  return children;
}

export default ProtectedRoute;
