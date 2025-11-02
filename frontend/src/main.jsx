import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // Router ko import karein

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* App ko BrowserRouter se wrap karna zaroori hai */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
