import React from 'react';

// Naya prop 'onImageClick' add kiya gaya hai
function ProductCard({ product, onOrderNow, onImageClick }) {
  // Helper function: Stock ke hisaab se color return karega
  const getStockColor = () => {
    if (product.stock === 0) return 'text-red-600';
    if (product.stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Helper function: Stock message return karega
  const getStockMessage = () => {
    if (product.stock === 0) return 'Stock Khatam!';
    if (product.stock < 10) return `Jaldi karein! (${product.stock} left)`;
    return `Stock mein hai (${product.stock})`;
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col">
      {/* Product Image Container */}
      <div 
        className="w-full h-64 bg-white overflow-hidden cursor-zoom-in group"
        onClick={() => onImageClick(product.imageUrl, product.modelName)} // Naya click handler
      >
        <img
          src={product.imageUrl}
          alt={product.modelName}
          // --- YEH "BEHTREEN" (AWESOME) FIX HAI ---
          // 'object-cover' (jo image kaat raha tha) ko 'object-contain' se badal diya hai
          // Isse poori image dikhegi. 'group-hover:scale-105' ek chhota sa zoom effect dega.
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          // --- END OF FIX ---
        />
      </div>

      {/* Product Details (flex-grow taaki card ki height same rahe) */}
      <div className="p-5 flex flex-col grow">
        <h4
          className="text-xl font-bold text-gray-800 truncate"
          title={product.modelName}
        >
          {product.modelName}
        </h4>
        <p className="text-sm text-gray-500 mb-2">
          {product.coverType} | {product.color}
        </p>
        
        {/* Spacer (taaki price/stock neeche rahe) */}
        <div className="grow"></div> 
        
        <div className="flex justify-between items-center mt-4">
          <p className="text-2xl font-extrabold text-blue-600">
            ₹{product.price}
          </p>
          <p className={`text-sm font-semibold ${getStockColor()}`}>
            {getStockMessage()}
          </p>
        </div>
        
        {product.stock === 0 && (
          <button
            onClick={() => onOrderNow(product.modelName)}
            className="order-now-btn w-full mt-4 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
          >
            Order Now
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;

