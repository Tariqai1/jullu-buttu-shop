import cloudinary
import os
# from dotenv import load_dotenv # Hum .env ko skip kar rahe hain

# .env file se environment variables load karna
# load_dotenv()

# --- HARDCODED VALUES FOR TESTING ---
# Apni 'Cloud Name' yahaan daalein
CLOUD_NAME = "dhlfaiijj" 
# Aapka API Key
API_KEY = "456651635141189"
# Aapka API Secret
API_SECRET = "Enx9kqcnbLRaPGVlUdxX9IdKtpA"
# --- END OF HARDCODED VALUES ---


# Environment variables fetch karna
# CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
# API_KEY = os.getenv("CLOUDINARY_API_KEY")
# API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Check karna ki saari details maujood hain
if not all([CLOUD_NAME, API_KEY, API_SECRET]):
    raise Exception("Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) not set!")

# Cloudinary SDK ko configure karna
def setup_cloudinary():
    """
    Cloudinary configuration ko initialize karta hai.
    """
    try:
        cloudinary.config(
            cloud_name = CLOUD_NAME, 
            api_key = API_KEY, 
            api_secret = API_SECRET,
            secure = True  # HTTPS URLs ka istemal karne ke liye
        )
        print("Cloudinary configuration successful (Using hardcoded keys for testing).")
    except Exception as e:
        print(f"Error configuring Cloudinary: {e}")
        raise