import React, { useState, useEffect } from 'react'; // useEffect ko import karein
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseCircleOutline } from 'react-icons/io5'; // Close icon

function OrderModal({ show, modelName, onClose, onSubmit }) {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- NAYA "BEHTREEN" (AWESOME) FEATURE ---
  // Model name ke liye local state, taaki user ise edit kar sake
  const [localModelName, setLocalModelName] = useState(modelName);

  // Jab bhi 'modelName' prop (bahar se) badalta hai, local state ko update karein
  useEffect(() => {
    setLocalModelName(modelName);
  }, [modelName, show]); // 'show' par bhi depend karein taaki modal khulne par reset ho
  // --- END OF FEATURE ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- NAYA VALIDATION ---
    if (!localModelName.trim()) {
      alert('Please mobile ka model name daalein.');
      return;
    }
    // --- NAYA VALIDATION ---

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      alert('Please sahi 10-digit phone number daalein.');
      return;
    }
    
    setIsSubmitting(true);
    // Submit karte waqt local (edited) model name bhejein
    await onSubmit(phone, localModelName);
    setIsSubmitting(false);
    
    // Form ko reset karein
    setPhone(''); 
    setLocalModelName(''); // Model name ko bhi reset karein
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
            >
              <IoCloseCircleOutline />
            </button>
            
            <h2 className="text-2xl font-bold text-center mb-4">Order Now</h2>
            <p className="text-center text-gray-600 mb-6">
              Aap jo cover dhoondh rahe hain, uska model naam neeche daalein. Hum aapko call karenge jab yeh available hoga!
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Model*
                </label>
                <input
                  type="text"
                  // --- YEH BADLA HAI ---
                  value={localModelName} // Local state se control
                  onChange={(e) => setLocalModelName(e.target.value)} // User ko type karne dein
                  placeholder="e.g., iPhone 15 Pro Max"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" // 'readOnly' aur 'bg-gray-100' hata diya
                  // --- YEH BADLA HAI ---
                />
              </div>
              <div className="mb-6">
                <label htmlFor="order-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Aapka 10-digit Phone Number*
                </label>
                <input
                  type="tel"
                  id="order-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength="10"
                  className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default OrderModal;

