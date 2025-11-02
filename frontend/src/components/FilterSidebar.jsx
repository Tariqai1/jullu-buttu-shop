import React, { useState } from 'react'; // useState ko import karein
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence ko import karein
import { IoClose } from 'react-icons/io5'; 
import { FaChevronDown } from 'react-icons/fa'; // Accordion icon ke liye

// Naye "Behtreen" (Awesome) Filter Options
const colorOptions = [
  { name: 'All', hex: 'all', colorClass: 'bg-gray-400' },
  { name: 'Black', hex: 'Black', colorClass: 'bg-black' },
  { name: 'White', hex: 'White', colorClass: 'bg-white border-2 border-gray-300' },
  { name: 'Blue', hex: 'Blue', colorClass: 'bg-blue-600' },
  { name: 'Red', hex: 'Red', colorClass: 'bg-red-600' },
  { name: 'Green', hex: 'Green', colorClass: 'bg-green-600' },
  { name: 'Pink', hex: 'Pink', colorClass: 'bg-pink-400' },
];

const genderOptions = [
  { value: 'all', label: 'All Genders' },
  { value: 'Gents', label: 'Gents' },
  { value: 'Ladies', label: 'Ladies' },
  { value: 'Unisex', label: 'Unisex' },
];

// --- Main Sidebar Component ---
function FilterSidebar({ categories, onFilterChange, isOpen, onClose }) {
  
  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:block w-full md:w-1/4 p-6 bg-white rounded-xl shadow-lg h-fit sticky top-24">
        <h3 className="text-2xl font-bold mb-6 border-b pb-3">Filters</h3>
        <FilterForm categories={categories} onFilterChange={onFilterChange} />
      </aside>

      {/* --- Mobile Sidebar --- */}
      <motion.aside
        className="md:hidden fixed top-0 left-0 w-4/5 max-w-sm h-full bg-white z-40 shadow-xl overflow-y-auto"
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h3 className="text-2xl font-bold">Filters</h3>
            <button onClick={onClose} className="text-gray-600 text-3xl">
              <IoClose />
            </button>
          </div>
          <FilterForm categories={categories} onFilterChange={onFilterChange} />
        </div>
      </motion.aside>
    </>
  );
}

// --- "Behtreen" (Awesome) Accordion Section ---
// Yeh ek naya reusable component hai
function AccordionSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4"
      >
        <h4 className="text-lg font-semibold">{title}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown className="text-gray-500" />
        </motion.div>
      </button>
      
      {/* Accordion Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// --- End of Accordion ---


// --- Naya Component: Filter Form ---
function FilterForm({ categories, onFilterChange }) {
  
  // State to track selected color
  const [selectedColor, setSelectedColor] = useState('all');

  const handlePriceChange = (e) => {
    // Sabhi price display elements ko dhoondho
    const priceDisplays = document.querySelectorAll('.price-value-display');
    priceDisplays.forEach(display => {
      if(display) display.textContent = `₹${e.target.value}`;
    });
    onFilterChange(e);
  };
  
  // --- Naya Color Click Handler ---
  const handleColorClick = (colorValue) => {
    setSelectedColor(colorValue);
    // onFilterChange event ko manually banayein
    onFilterChange({
      target: {
        name: 'color', // Backend 'color' parameter se match karega
        value: colorValue === 'all' ? '' : colorValue // Agar 'All' hai to empty string bhejein
      }
    });
  };

  return (
    // Form ko Accordion Sections se badal diya gaya hai
    <div className="space-y-2">

      {/* 1. Category Filter (Accordion) */}
      <AccordionSection title="Category" defaultOpen={true}>
        <select
          id="category-filter"
          name="category_id"
          onChange={onFilterChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          
          {/* --- "BEHTREEN" (AWESOME) 100% FIX --- */}
          {/* Hum check karenge ki cat.id valid hai ya nahi. */}
          {/* Agar id nahi hai, to hum ek random key (index) ka istemal karenge. */}
          {categories.map((cat, index) => (
            <option key={cat.id || `cat-${index}`} value={cat.id}> {/* <-- YEH HAI 100% FIX */}
              {cat.name}
            </option>
          ))}
          {/* --- END OF FIX --- */}

        </select>
      </AccordionSection>

      {/* 2. Gender Filter (Accordion) */}
      <AccordionSection title="For" defaultOpen={true}>
        <div className="flex flex-wrap gap-2">
          {genderOptions.map((gender) => (
            <React.Fragment key={gender.value}> {/* Key yahaan bilkul sahi hai */}
              <input
                type="radio"
                id={`gender-${gender.value}`}
                name="gender"
                value={gender.value}
                onChange={onFilterChange}
                className="hidden"
                defaultChecked={gender.value === 'all'}
              />
              <label
                htmlFor={`gender-${gender.value}`}
                className="gender-label cursor-pointer px-4 py-2 border rounded-lg transition-all duration-200 capitalize"
              >
                {gender.label}
              </label>
            </React.Fragment>
          ))}
        </div>
        <style>{`
          input[name="gender"]:checked + .gender-label {
            background-color: #2563eb;
            color: white;
            border-color: #2563eb;
          }
        `}</style>
      </AccordionSection>

      {/* 3. NAYA "BEHTREEN" (AWESOME) COLOR FILTER --- */}
      <AccordionSection title="Color" defaultOpen={true}>
        <div className="flex flex-wrap gap-3">
          {colorOptions.map(color => (
            <button
              key={color.name}
              type="button"
              onClick={() => handleColorClick(color.hex)}
              className={`w-8 h-8 rounded-full ${color.colorClass} transition-all duration-200
                ${selectedColor === color.hex 
                  ? 'ring-2 ring-blue-500 ring-offset-2' // Selected state
                  : 'hover:scale-110' // Hover state
                }
              `}
              title={color.name}
            >
              {/* 'All' button ke liye icon */}
              {color.hex === 'all' && (
                <span className="text-white font-bold text-xs">ALL</span>
              )}
            </button>
          ))}
        </div>
      </AccordionSection>
      {/* --- END OF NAYA FILTER --- */}
      
      {/* 4. Price Range Filter (Accordion) */}
      <AccordionSection title="Price">
        <label className="block text-sm font-semibold mb-2" htmlFor="price-filter">
          Max Price: <span className="price-value-display font-bold text-blue-600">₹5000</span>
        </label>
        <input
          type="range"
          id="price-filter"
          name="maxPrice"
          min="0"
          max="5000"
          defaultValue="5000"
          step="100"
          onChange={handlePriceChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </AccordionSection>
    </div>
  );
}

export default FilterSidebar;

