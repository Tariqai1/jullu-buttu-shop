import React from 'react';
import { motion } from 'framer-motion';
import { FaMobileAlt, FaHeadphones, FaChargingStation } from 'react-icons/fa'; // Icons

// Helper function: Category ke naam ke hisaab se icon dega
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('earphone') || name.includes('headphone')) {
    return <FaHeadphones className="text-4xl text-white" />;
  }
  if (name.includes('charger') || name.includes('cable')) {
    return <FaChargingStation className="text-4xl text-white" />;
  }
  // Default icon
  return <FaMobileAlt className="text-4xl text-white" />;
};

// Helper function: Category ke naam ke hisaab se color dega
const getCategoryColor = (index) => {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-red-500 to-red-700',
    'from-yellow-500 to-yellow-700',
    'from-indigo-500 to-indigo-700',
  ];
  return colors[index % colors.length]; // Har category ko alag color
};

function CategoryGrid({ categories, onCategoryClick }) {
  if (!categories || categories.length === 0) {
    return null; // Agar categories nahi hain, to kuchh mat dikhao
  }

  // --- NAYA "BEHTREEN" (AWESOME) CARD COMPONENT ---
  // Humne card ko ek alag component bana liya hai taaki code repeat na ho
  const CategoryCard = ({ category, index, className = "" }) => (
    <motion.div
      key={category.id || `cat-${index}`}
      className={`h-48 p-6 rounded-xl shadow-lg
                  flex flex-col justify-between items-center cursor-pointer
                  bg-gradient-to-br ${getCategoryColor(index)}
                  transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
                  ${className}`} // Extra classes yahaan apply hongi
      onClick={() => onCategoryClick(category.name)} // Click to search
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {getCategoryIcon(category.name)}
      <h3 className="text-xl font-bold text-white text-center drop-shadow-md">
        {category.name}
      </h3>
    </motion.div>
  );
  // --- END OF NAYA COMPONENT ---

  return (
    <div className="my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Shop by Category
      </h2>
      
      {/* --- NAYA "BEHTREEN" (AWESOME) RESPONSIVE LAYOUT --- */}
      
      {/* 1. Mobile View (Horizontal Scroll) */}
      {/* 'md:hidden' ka matlab hai ki yeh layout tablet (md) ya usse badi screen par chhip jayega */}
      <div className="flex gap-4 pb-4 overflow-x-auto md:hidden">
        {categories.map((category, index) => (
          <CategoryCard 
            category={category} 
            index={index} 
            className="flex-shrink-0 w-48" // Mobile par fixed width
          />
        ))}
      </div>

      {/* 2. Tablet/Desktop View (Grid) */}
      {/* 'hidden md:grid' ka matlab hai ki yeh layout mobile par chhipa rahega, lekin tablet (md) ya usse badi screen par grid ban jayega */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
           <CategoryCard 
            category={category} 
            index={index} 
            className="w-full" // Tablet par poori grid width
          />
        ))}
      </div>
      {/* --- END OF NAYA LAYOUT --- */}

    </div>
  );
}

export default CategoryGrid;

