import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTags, FaTrash, FaSpinner } from 'react-icons/fa';

// API URL ko .env file se import karna
const API_URL = import.meta.env.VITE_API_BASE_URL;

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Nayi category add karne ke liye state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories fetch karne ke liye function
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Categories load nahi ho pa rahi.' });
    } finally {
      setLoading(false);
    }
  };

  // Page load par categories fetch karein
  useEffect(() => {
    fetchCategories();
  }, []);

  // Nayi category submit karne par
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) {
      setMessage({ type: 'error', text: 'Category name zaroori hai.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post(`${API_URL}/categories`, {
        name: newCategoryName,
        description: newCategoryDesc
      });
      
      // List ko refresh karein
      fetchCategories(); 
      setMessage({ type: 'success', text: `Category '${response.data.name}' safaltapurvak ban gayi!` });
      
      // Form reset karein
      setNewCategoryName('');
      setNewCategoryDesc('');
      
    } catch (err) {
      console.error("Add Category Error:", err);
      if (err.response && err.response.status === 400) {
        setMessage({ type: 'error', text: err.response.data.detail });
      } else {
        setMessage({ type: 'error', text: 'Category banane mein fail hua.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category delete karne par
  const handleDeleteCategory = async (id, name) => {
    // Confirm karein
    if (!window.confirm(`Kya aap waqai '${name}' category ko delete karna chahte hain?`)) {
      return;
    }

    setMessage({ type: '', text: '' });
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      setMessage({ type: 'success', text: `Category '${name}' delete ho gayi.` });
      // List ko refresh karein
      fetchCategories();
    } catch (err) {
      console.error("Delete Category Error:", err);
      setMessage({ type: 'error', text: 'Category delete nahi ho paayi.' });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Categories</h1>

      {/* Success/Error Message Box */}
      {message.text && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column - Add New Category */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Add New Category</h2>
          <form onSubmit={handleAddCategory}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md" 
                placeholder="e.g., Silicone Cases"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Soft silicone cases..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaTags />}
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* Right Column - Existing Categories */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Existing Categories</h2>
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <FaSpinner className="animate-spin text-2xl text-gray-400" />
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categories.length === 0 && <p className="text-gray-500">Abhi koi category nahi hai.</p>}
              {categories.map(cat => (
                <li key={cat.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{cat.name}</h3>
                    {cat.description && <p className="text-sm text-gray-500">{cat.description}</p>}
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title={`Delete ${cat.name}`}
                  >
                    <FaTrash className="text-xl" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCategories;

