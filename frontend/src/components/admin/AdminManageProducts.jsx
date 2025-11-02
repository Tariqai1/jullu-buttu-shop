import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaToggleOn, FaToggleOff, FaSync } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

// --- "BEHTREEN" (AWESOME) UPDATE ---
// Humne URL ke aakhir mein "/" (slash) add kar diya hai
// Taaki 307 Redirect na ho
const API_URL = import.meta.env.VITE_API_BASE_URL;
const COVERS_API_URL_SLASH = `${API_URL}/covers/`; // Slash ke saath (GET ke liye)
const CATEGORIES_API_URL_SLASH = `${API_URL}/categories/`; // Slash ke saath (GET ke liye)

// PUT/DELETE ke liye (bina slash, kyunki Python router (/{id}) slash expect nahi karta)
const COVERS_API_URL_NOSLASH = `${API_URL}/covers`; 
// --- END OF UPDATE ---

// --- Edit Modal (Yeh bilkul sahi tha) ---
function EditProductModal({ show, product, allCategories, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    if (product) {
      setFormData({
        modelName: product.modelName || '',
        coverType: product.coverType || '',
        color: product.color || '',
        price: product.price || 0,
        stock: product.stock || 0,
        genderPreference: product.genderPreference || 'Unisex',
        tags: (product.tags || []).join(', '),
        category_ids: product.category_ids || [],
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const { options } = e.target;
    const selectedValues = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, category_ids: selectedValues }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    };
    onSave(product.id, updatedData);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full relative my-8"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl">
              <IoClose />
            </button>
            <h2 className="text-2xl font-bold text-center mb-6">Edit Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name*</label>
                <input type="text" name="modelName" value={formData.modelName || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Type*</label>
                  <input type="text" name="coverType" value={formData.coverType || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color*</label>
                  <input type="text" name="color" value={formData.color || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)*</label>
                  <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
                  <input type="number" name="stock" value={formData.stock || 0} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="genderPreference" value={formData.genderPreference || 'Unisex'} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="Unisex">Unisex</option>
                  <option value="Ladies">Ladies</option>
                  <option value="Gents">Gents</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input type="text" name="tags" value={formData.tags || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories* (Hold Ctrl/Cmd)</label>
                <select multiple name="category_ids" value={formData.category_ids || []} onChange={handleCategoryChange} className="w-full h-32 p-2 border border-gray-300 rounded-md">
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all">
                Save Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
// --- END OF EDIT MODAL ---


function AdminManageProducts({ activeTab }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingModal, setEditingModal] = useState({ show: false, product: null });

  // Products aur Categories fetch karne ke liye function
  const fetchData = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('admin_mode', true);
      if (search) {
        params.append('model', search);
      }
      
      const config = {
        params,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      };
      
      // --- "BEHTREEN" (AWESOME) FIX ---
      // Hum '.../' (slash ke saath) wale URL ka istemal kar rahe hain
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(COVERS_API_URL_SLASH, config), 
        axios.get(CATEGORIES_API_URL_SLASH, config) 
      ]);
      // --- END OF FIX ---

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      
      if (productsRes.data.length === 0) {
        setError('Is search ke liye koi product nahi mila.');
      }
    } catch (err) {
      setError('Data load nahi ho pa raha.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchData(searchTerm);
    }
  }, [activeTab]); 

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchTerm);
  };

  // Product Delete Karna (FIXED)
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Kya aap waqai '${name}' product ko delete karna chahte hain?`)) {
      return;
    }
    try { 
      // --- "BEHTREEN" (AWESOME) FIX ---
      // Hum '.../{id}' (bina slash) wale URL ka istemal kar rahe hain
      await axios.delete(`${COVERS_API_URL_NOSLASH}/${id}`); 
      // --- END OF FIX ---
      setProducts(products.filter(p => p.id !== id));
      alert('Product delete ho gaya!');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Product database mein nahi mila. List ko refresh kiya ja raha hai...");
        fetchData(searchTerm); 
      } else {
        setError('Product delete nahi ho paaya.');
      }
    }
  };
  
  // Available/Unavailable Toggle Karna
  const handleToggleAvailability = async (product) => {
    const newAvailability = !product.is_available;
    try {
      // --- "BEHTREEN" (AWESOME) FIX ---
      const response = await axios.put(`${COVERS_API_URL_NOSLASH}/${product.id}`, { // URL (bina slash)
        is_available: newAvailability
      });
      // --- END OF FIX ---
      setProducts(products.map(p => (p.id === product.id ? response.data : p)));
    } catch (err) {
      setError('Status update nahi ho paaya.');
    }
  };
  
  // Edit Feature
  const handleEdit = (product) => {
    setEditingModal({ show: true, product: product });
  };
  
  const handleCloseEditModal = () => {
    setEditingModal({ show: false, product: null });
  };
  
  const handleUpdateProduct = async (id, updatedData) => {
    try {
      // --- "BEHTREEN" (AWESOME) FIX ---
      const response = await axios.put(`${COVERS_API_URL_NOSLASH}/${id}`, updatedData); // URL (bina slash)
      // --- END OF FIX ---
      setProducts(products.map(p => (p.id === id ? response.data : p)));
      handleCloseEditModal();
      alert("Product safaltapurvak update ho gaya!");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Product database mein nahi mila. List ko refresh kiya ja raha hai...");
        fetchData(searchTerm); 
      } else {
        setError('Product update nahi ho paaya.');
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Products</h1>

      {/* Search Bar & Refresh */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex gap-4">
        <form onSubmit={handleSearch} className="flex-grow flex">
          <input 
            type="text"
            placeholder="Search products by model name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-l-md"
          />
          <button type="submit" className="p-3 bg-blue-600 text-white rounded-r-md">
            <FaSearch />
          </button>
        </form>
        <button 
          onClick={() => fetchData(searchTerm)} 
          disabled={loading}
          className="p-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-md mb-6 bg-red-100 text-red-800">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Name / Color</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price / Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="5" className="text-center p-4">Loading products...</td>
                </tr>
              )}
              {products.map(product => (
                <tr key={product.id} className={!product.is_available ? 'bg-gray-100 opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.imageUrl} alt={product.modelName} className="w-12 h-12 object-cover rounded-md" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.modelName}</div>
                    <div className="text-sm text-gray-500">{product.color}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                    <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleAvailability(product)}
                      className={`text-2xl ${product.is_available ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      {product.is_available ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <span className={`ml-2 text-sm font-medium ${product.is_available ? 'text-green-700' : 'text-gray-500'}`}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id, product.modelName)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditProductModal
        show={editingModal.show}
        product={editingModal.product}
        allCategories={categories}
        onClose={handleCloseEditModal}
        onSave={handleUpdateProduct}
      />
    </div>
  );
}

export default AdminManageProducts;

