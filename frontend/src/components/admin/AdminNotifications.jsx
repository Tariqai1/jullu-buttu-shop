import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaSync, FaSpinner } from 'react-icons/fa';

// API URL ko .env file se import karna
const API_URL = import.meta.env.VITE_API_BASE_URL;

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('Pending'); // Naya state filter ke liye

  // Notifications fetch karne ke liye function
  const fetchNotifications = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      // Humne backend ko update kar diya hai, ab yeh sabhi notifications layega
      const response = await axios.get(`${API_URL}/notify`);
      setNotifications(response.data);
      if (response.data.length === 0) {
        setMessage({ type: 'info', text: 'Koi pre-order requests nahi hain.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Pre-orders load nahi ho pa rahe.' });
    } finally {
      setLoading(false);
    }
  };

  // Page load par notifications fetch karein
  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- NAYA FUNCTION: Status Update Karne Ke Liye ---
  const handleStatusChange = async (id, newStatus) => {
    setMessage({ type: '', text: '' });
    try {
      // Naye PUT endpoint ko call karein
      const response = await axios.put(`${API_URL}/notify/${id}`, {
        status: newStatus
      });

      // Frontend state ko turant update karein (bina refresh kiye)
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? response.data : notif
        )
      );
      setMessage({ type: 'success', text: 'Status update ho gaya!' });
      
    } catch (err) {
      console.error("Status Update Error:", err);
      setMessage({ type: 'error', text: 'Status update nahi ho paaya.' });
    }
  };
  // --- NAYA FUNCTION ---

  // Helper function: Date ko format karne ke liye
  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Helper function: Status ke hisaab se color dene ke liye
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'All') return true;
    return notif.status === filter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pre-Order Requests</h1>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSync />}
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {/* --- NAYA FILTER BAR --- */}
      <div className="mb-6 flex gap-2">
        {['Pending', 'In Progress', 'Completed', 'Cancelled', 'All'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      {/* --- NAYA FILTER BAR --- */}

      {/* Success/Error Message Box */}
      {message.text && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 
          message.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* List of Notifications */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !message.text && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto" />
                  </td>
                </tr>
              )}
              {filteredNotifications.map(notification => (
                <tr key={notification.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{notification.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{notification.modelName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(notification.createdAt)}</div>
                  </td>
                  {/* --- NAYA STATUS COLUMN --- */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                      {notification.status}
                    </span>
                  </td>
                  {/* --- NAYA ACTION COLUMN --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select 
                      value={notification.status}
                      onChange={(e) => handleStatusChange(notification.id, e.target.value)}
                      className={`p-2 border rounded-lg ${
                        notification.status === 'Completed' || notification.status === 'Cancelled' ? 'border-gray-300' : 'border-blue-500'
                      }`}
                      disabled={notification.status === 'Completed' || notification.status === 'Cancelled'}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;


