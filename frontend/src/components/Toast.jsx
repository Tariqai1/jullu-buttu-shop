import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircleOutline } from 'react-icons/io5'; // Checkmark icon

function Toast({ message, show, onHide }) {
  useEffect(() => {
    if (show) {
      // 3 second baad toast ko automatically hide karein
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      
      // Cleanup timer
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-10 right-10 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          <IoCheckmarkCircleOutline className="text-2xl" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
