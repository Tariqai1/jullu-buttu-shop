import React from 'react';
import { FaWhatsapp, FaInstagram, FaYoutube, FaMapMarkerAlt } from 'react-icons/fa'; // Naya icon

// --- Aapke Links (Updated) ---
const WHATSAPP_LINK = "https://wa.me/911234567890"; // Example link
const INSTAGRAM_LINK = "https://www.instagram.com/jullubuttu?igsh=MWdjMHpzMDYybThjaQ=="; // Aapka naya link
const YOUTUBE_LINK = "https://www.youtube.com/channel/UCvXtbe90dYz3zs44Qgft8Dg"; // Aapka naya link
const GOOGLE_MAPS_LINK = "https://www.google.com/maps?q=19.1678809,73.0259094&z=17&hl=en"; // Aapka link
// ---------------------------------

function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-12 mt-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* --- Column 1: Address (Kausa Mumbra) --- */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Shop 1: Kausa</h3>
          <p className="text-gray-400">Jullu Buttu (Kausa Branch)</p>
          <p className="text-gray-400">Gali No. 1, Near Masjid,</p>
          <p className="text-gray-400">Kausa, Mumbra, Thane - 400612</p>
          <a
            href={GOOGLE_MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FaMapMarkerAlt />
            View on Google Maps
          </a>
        </div>

        {/* --- Column 2: Address (Amrut Nagar) --- */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Shop 2: Amrut Nagar</h3>
          <p className="text-gray-400">Jullu Buttu (Amrut Nagar Branch)</p>
          <p className="text-gray-400">Shop No. 10, Main Road,</p>
          <p className="text-gray-400">Amrut Nagar, Mumbra, Thane - 400612</p>
           <a
            href={GOOGLE_MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FaMapMarkerAlt />
            View on Google Maps
          </a>
        </div>

        {/* --- Column 3: Humse Judein (Social Media) --- */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Humse Judein</h3>
          <div className="flex justify-center md:justify-start gap-6">
            <a
  href="https://wa.me/919555185754"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="WhatsApp"
  className="text-3xl text-gray-400 hover:text-green-500 transition-all duration-300 transform hover:scale-110"
>
  <FaWhatsapp />
</a>
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-3xl text-gray-400 hover:text-pink-500 transition-all duration-300 transform hover:scale-110"
            >
              <FaInstagram />
            </a>
            <a
              href={YOUTUBE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-3xl text-gray-400 hover:text-red-600 transition-all duration-300 transform hover:scale-110"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

      </div>
      <div className="container mx-auto px-4 text-center border-t border-gray-700 pt-6 mt-8">
        <p>&copy; {new Date().getFullYear()} Jullu Buttu Mobile Shope. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

