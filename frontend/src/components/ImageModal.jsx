import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

function ImageModal({ src, alt, show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Bahar click karne par band karein
        >
          <motion.div
            className="relative"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute -top-10 -right-2 text-white text-4xl hover:text-gray-300"
            >
              <IoClose />
            </button>
            <img
              src={src}
              alt={alt}
              className="max-w-5xl max-h-screen-lg object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()} // Image par click karne se modal band na ho
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ImageModal;
