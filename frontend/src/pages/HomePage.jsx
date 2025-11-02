import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar'; // Naya import
import ProductGrid from '../components/ProductGrid';
import ImageModal from '../components/ImageModal';
import CategoryGrid from '../components/CategoryGrid'; // Naya "Behtreen" (Awesome) Component

// API URL ko .env file se import karna
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Advanced: Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- NAYA "BEHTREEN SE BEHTREEN" (AWESOME) HERO COMPONENT ---
function HeroSection({ onSearchClick }) {
  return (
    <div className="w-full bg-gradient-to-r from-blue-700 to-purple-800 text-white pt-12 pb-24 px-4 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          Welcome to Jullu Buttu!
        </h1>
        <p className="text-xl md:text-2xl text-blue-200 mb-8 drop-shadow-md">
          Har Model, Har Style. Aapka perfect cover yahaan hai.
        </p>
        <motion.button
          onClick={onSearchClick} // Yeh search bar tak scroll karega
          className="px-8 py-3 bg-white text-blue-700 font-bold rounded-full text-lg shadow-xl transition-transform duration-300 transform hover:scale-105 hover:bg-gray-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Abhi Search Karein
        </motion.button>
      </motion.div>
    </div>
  );
}
// --- END OF HERO COMPONENT ---


function HomePage({ onOrderNow }) {
    // --- State Management ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    // --- "BEHTREEN" (AWESOME) UPDATE ---
    // Hum 'error' ko 'message' (ek object) se badal rahe hain
    const [message, setMessage] = useState({ type: '', text: '' });
    // --- END OF UPDATE ---
    
    const [filters, setFilters] = useState({
        model: '',
        category_id: 'all',
        gender: 'all',
        maxPrice: '5000',
        color: '', // Naya color state
    });
    
    const [imageModal, setImageModal] = useState({ show: false, src: '', alt: '' });
    
    // --- "BEHTREEN" (AWESOME) FIX ---
    // Filter sidebar ko mobile par dikhane/chhipane ke liye
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // --- END OF FIX ---
    
    const searchRef = React.useRef(null);

    // --- API Call: Categories Fetch karna ---
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories/`);
            setCategories(response.data);
        } catch (err) {
            console.warn("Categories fetch nahi ho pa rahi:", err);
        }
    };

    // --- API Call: Products Fetch karna (Updated) ---
    const fetchProducts = async (currentFilters) => {
        setLoading(true);
        setMessage(null); // Message ko clear karein
        
        const params = new URLSearchParams();
        
        // Agar model, category, gender, color sab "all" hai, to request na bhejein
        if (!currentFilters.model.trim() && currentFilters.category_id === 'all' && currentFilters.gender === 'all' && !currentFilters.color) {
            setProducts([]);
            setLoading(false);
            // --- "BEHTREEN" (AWESOME) UPDATE ---
            // 'info' type ka message set karein
            setMessage({ type: 'info', text: "🕵️‍♂️ Khali-khali lag raha hai? Upar model ka naam search karein!" });
            // --- END OF UPDATE ---
            return;
        }
        
        // Params add karein
        if (currentFilters.model.trim()) {
            params.append('model', currentFilters.model.trim());
        }
        if (currentFilters.gender !== 'all') {
            params.append('gender', currentFilters.gender);
        }
        if (currentFilters.category_id !== 'all') {
            params.append('category_ids', currentFilters.category_id);
        }
        if (currentFilters.color) {
            params.append('color', currentFilters.color);
        }
        params.append('maxPrice', currentFilters.maxPrice);

        try {
            const response = await axios.get(`${API_URL}/covers/`, { params });
            setProducts(response.data);
            
            if (response.data.length === 0) {
                // --- "BEHTREEN" (AWESOME) UPDATE ---
                // 'info' type ka message set karein
                setMessage({ type: 'info', text: "Mila nahi? Fikr not! 'Custom Order' button dabayein aur humein batayein." });
                // --- END OF UPDATE ---
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            // --- "BEHTREEN" (AWESOME) UPDATE ---
            // 'error' type ka message set karein
            setMessage({ type: 'error', text: "Server se connect nahi ho pa raha. Kya Python server chal raha hai?" });
            // --- END OF UPDATE ---
        } finally {
            setLoading(false);
        }
    };

    // Page load par categories fetch karein
    useEffect(() => {
        fetchCategories();
        setLoading(false); 
        setMessage({ type: 'info', text: "🕵️‍♂️ Khali-khali lag raha hai? Upar model ka naam search karein!" });
    }, []);

    // Debounced fetch function
    const debouncedFetch = useCallback(debounce(fetchProducts, 500), [categories]);

    // Filter change hone par
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        debouncedFetch(newFilters);
    };

    // Search change hone par
    const handleSearchChange = (searchTerm) => {
        const newFilters = { ...filters, model: searchTerm };
        setFilters(newFilters);
        debouncedFetch(newFilters);
    };

    // --- "BEHTREEN" (AWESOME) FIX ---
    // Mobile filter toggle ke liye (yeh 'Header' button se call hoga)
    const handleFilterToggle = () => {
        setIsFilterOpen(prev => !prev);
    };
    // --- END OF FIX ---
    
    // Hero button click karne par
    const handleHeroSearchClick = () => {
        searchRef.current?.querySelector('input')?.focus();
    };
    
    // Category card click karne par
    const handleCategoryClick = (categoryName) => {
        const searchInput = searchRef.current?.querySelector('input');
        if (searchInput) {
            searchInput.value = categoryName; 
        }
        handleSearchChange(categoryName);
    };
    
    // Image Modal Functions
    const handleImageClick = (src, alt) => {
        setImageModal({ show: true, src, alt });
    };
    const handleCloseImageModal = () => {
        setImageModal({ show: false, src: '', alt: '' });
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <Header 
                onOrderNowClick={onOrderNow} 
                onFilterToggle={handleFilterToggle} // Naya prop pass karein
            />
            
            <HeroSection onSearchClick={handleHeroSearchClick} />
            
            <main className="flex-grow container mx-auto p-4 max-w-7xl mt-[-4rem] z-10">
                
                <div ref={searchRef}>
                  <SearchBar onSearchChange={handleSearchChange} />
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* --- "BEHTREEN" (AWESOME) FIX --- */}
                    {/* Yeh sidebar ab mobile par conditionally render hoga */}
                    <AnimatePresence>
                        {isFilterOpen && (
                             <div 
                                className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                                onClick={handleFilterToggle} // Bahar click karne par band karein
                            ></div>
                        )}
                        <FilterSidebar 
                            categories={categories} 
                            onFilterChange={handleFilterChange}
                            isOpen={isFilterOpen} // Naya prop pass karein
                            onClose={handleFilterToggle} // Naya prop pass karein
                        />
                    </AnimatePresence>
                    {/* --- END OF FIX --- */}

                    <ProductGrid
                        loading={loading}
                        message={message} // 'error' ko 'message' se badal diya
                        products={products}
                        onOrderNow={onOrderNow}
                        searchTerm={filters.model} 
                        onImageClick={handleImageClick}
                    />
                </div>
            </main>

            <Footer />
            
            <ImageModal 
                show={imageModal.show}
                src={imageModal.src}
                alt={imageModal.alt}
                onClose={handleCloseImageModal}
            />
        </div>
    );
}

export default HomePage;

