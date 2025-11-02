import React from 'react';
import ProductCard from './ProductCard'; 
import SkeletonCard from './SkeletonCard'; 
import { motion } from 'framer-motion'; 

// "Behtreen" (Awesome) Update:
// Humne 'error' ko 'message' (ek object) se badal diya hai
function ProductGrid({ loading, message, products, onOrderNow, searchTerm, onImageClick }) {
  
  // Loading State
  if (loading) {
    return (
      <div className="w-full md:w-3/4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // --- NAYA "BEHTREEN" (AWESOME) MESSAGE STATE ---
  if (message) {
    // Agar message ka type 'error' hai, to red dikhayein
    if (message.type === 'error') {
      return (
        // --- "BEHTREEN" (AWESOME) FIX: Center karne ke liye container ---
        <div className="w-full md:w-3/4 flex items-center justify-center"> 
          <div className="text-center p-6 bg-red-50 text-red-700 rounded-lg shadow-md w-full"> 
            <p className="text-xl font-semibold">😞 Oho!</p>
            <p>{message.text}</p>
          </div>
        </div>
      );
    }

    // Agar message ka type 'info' hai, to "behtreen" blue design dikhayein
    if (message.type === 'info') {
      return (
        // --- "BEHTREEN" (AWESOME) FIX: Center karne ke liye container ---
        <div className="w-full md:w-3/4 flex items-center justify-center"> 
          <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 rounded-lg shadow-lg border-l-4 border-blue-500 w-full">
        {/* --- END OF FIX --- */}
            <p className="text-2xl font-semibold mb-3">{message.text.split('?')[0]}?</p>
            <p className="text-gray-600 mb-5">{message.text.split('?')[1]}</p>
            
            {/* "Mila nahi?" wale message ke saath "Order Now" button */}
            {message.text.includes("Mila nahi") && (
              <button
                onClick={() => onOrderNow(searchTerm)}
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
              >
                Custom Order
              </button>
            )}
          </div>
        </div>
      );
    }
  }
  // --- END OF UPDATE ---

  // Products Found State
  return (
    <div className="w-full md:w-3/4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          
          // --- "BEHTREEN" (AWESOME) 100% FIX (DUPLICATE KEY) ---
          <motion.div
            key={product.id || `product-${index}`} // <-- YEH HAI 100% FIX
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProductCard 
              product={product} 
              onOrderNow={onOrderNow}
              onImageClick={onImageClick}
            />
          </motion.div>
          // --- END OF FIX ---
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;

