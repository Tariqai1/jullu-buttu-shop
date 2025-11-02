import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaTrash } from 'react-icons/fa';

// API URL ko .env file se import karna
const API_URL = import.meta.env.VITE_API_BASE_URL;

function AdminUpload() {
  // --- Common Details State ---
  // Yeh details sabhi variants (colors) ke liye same hongi
  const [modelName, setModelName] = useState('');
  const [coverType, setCoverType] = useState('Silicone');
  const [price, setPrice] = useState(0);
  const [genderPreference, setGenderPreference] = useState('Unisex');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // --- Variants State ---
  // Yahaan har color (variant) ki apni details aur file hogi
  const [variants, setVariants] = useState([]); // { id: 1, file: File, preview: '...', color: '', stock: 10 }

  // Loading aur message ke liye state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Page load par categories fetch karein
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data);
      } catch (err) {
        setMessage({ type: 'error', text: 'Categories load nahi ho pa rahi.' });
      }
    };
    fetchCategories();
  }, []);

  // --- Naya Function: Multiple Images Select Karne Par ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Har file ke liye ek naya variant object banayein
    const newVariants = files.map((file, index) => ({
      id: Date.now() + index, // Ek unique ID
      file: file,
      preview: URL.createObjectURL(file),
      color: '', // Admin ise bharega
      stock: 10, // Default stock
    }));
    
    setVariants(prevVariants => [...prevVariants, ...newVariants]);
  };
  
  // --- Naya Function: Variant ki details (color/stock) update karne par ---
  const handleVariantChange = (id, field, value) => {
    setVariants(prevVariants =>
      prevVariants.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };
  
  // --- Naya Function: Variant ko list se hatane par ---
  const removeVariant = (id) => {
    setVariants(prevVariants => prevVariants.filter(v => v.id !== id));
  };

  // Category selection ko handle karein
  const handleCategoryChange = (e) => {
    const { options } = e.target;
    const selectedValues = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setSelectedCategories(selectedValues);
  };

  // --- Updated Function: Form Submit Karne Par ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (variants.length === 0 || selectedCategories.length === 0 || !modelName || price <= 0) {
      setMessage({ type: 'error', text: 'Please common details, category, aur kam se kam ek variant image upload karein.' });
      return;
    }

    // Check karein ki sabhi variants ka color bhara hua hai
    if (variants.some(v => !v.color.trim())) {
      setMessage({ type: 'error', text: 'Please har variant (image) ke liye ek Color* zaroor daalein.' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: `Uploading ${variants.length} variants...` });

    let successfulUploads = 0;
    
    // --- Naya Logic: Har variant ke liye ek-ek karke API call karein ---
    for (const variant of variants) {
      const formData = new FormData();
      
      // Common details
      formData.append('modelName', modelName);
      formData.append('coverType', coverType);
      formData.append('price', price);
      formData.append('genderPreference', genderPreference);
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(t => t)));
      formData.append('category_ids', JSON.stringify(selectedCategories));
      
      // Variant-specific details
      formData.append('color', variant.color);
      formData.append('stock', variant.stock);
      formData.append('image', variant.file);

      try {
        await axios.post(`${API_URL}/covers`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        successfulUploads++;
      } catch (err) {
        console.error(`Upload Error for ${variant.color}:`, err);
        // Agar ek fail ho jaaye, to bhi continue karein
      }
    }
    
    setLoading(false);
    
    if (successfulUploads === variants.length) {
      setMessage({ type: 'success', text: `Sabhi ${successfulUploads} covers safaltapurvak upload ho gaye!` });
      // Form ko reset karein
      setModelName('');
      setCoverType('Silicone');
      setPrice(0);
      setTags('');
      setSelectedCategories([]);
      setVariants([]);
    } else {
      setMessage({ type: 'error', text: `${successfulUploads} / ${variants.length} covers upload hue. Kuch fail ho gaye (console check karein).` });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Upload New Product (Multiple Variants)</h1>
      
      {/* Success/Error/Info Message Box */}
      {message.text && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' :
          message.type ==='error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        
        {/* --- Section 1: Common Details --- */}
        <h2 className="text-2xl font-bold mb-6 border-b pb-3">1. Common Details</h2>
        <p className="mb-4 text-gray-600">Yeh details neeche upload kiye gaye sabhi colors/variants par apply hongi.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Details */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name*</label>
              <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., iPhone 14 Pro" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Type*</label>
                <input type="text" value={coverType} onChange={(e) => setCoverType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)*</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                <option value="Unisex">Unisex</option>
                <option value="Ladies">Ladies</option>
                <option value="Gents">Gents</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="New, Matte, Premium" />
            </div>
          </div>

          {/* Right Column - Category */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories* (Hold Ctrl/Cmd to select multiple)</label>
              <select 
                multiple 
                value={selectedCategories} 
                onChange={handleCategoryChange} 
                className="w-full h-48 p-2 border border-gray-300 rounded-md"
              >
                {categories.length === 0 && <option disabled>Loading categories...</option>}
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- Section 2: Upload Variants (Colors) --- */}
        <h2 className="text-2xl font-bold mt-8 mb-6 border-b pb-3">2. Upload Variants (Colors)</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Images* (Aap ek saath multiple images select kar sakte hain)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload files</span>
                  <input id="file-upload" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" multiple />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
            </div>
          </div>
        </div>

        {/* --- Naya Section: Variants List --- */}
        {variants.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Uploaded Variants:</h3>
            {variants.map((variant) => (
              <div key={variant.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img src={variant.preview} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                <div className="grow grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color*</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Red" 
                      value={variant.color}
                      onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Stock*</label>
                    <input 
                      type="number" 
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md" 
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeVariant(variant.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove variant"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="mt-8 border-t pt-6">
          <button 
            type="submit" 
            disabled={loading || variants.length === 0}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? `Uploading ${variants.length} covers...` : `Upload ${variants.length} Covers`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminUpload;

