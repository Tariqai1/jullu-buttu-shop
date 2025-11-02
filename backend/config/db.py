import motor.motor_asyncio
from dotenv import load_dotenv
import os

# .env file se environment variables load karna
load_dotenv()

# Environment variable se MongoDB URI fetch karna
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise Exception("MONGO_URI environment variable not set!")

# MongoDB se async connection banana
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)

# Database ko select karna
try:
    db_name = MONGO_URI.split('/')[-1].split('?')[0]
    if not db_name:
        raise ValueError("Could not parse database name from MONGO_URI")
    db = client[db_name]
except Exception as e:
    print(f"Warning: Could not parse DB name from URI, using default 'MobileCoverShop'. Error: {e}")
    db = client.MobileCoverShop

# --- Collections ---

# "covers" collection ko access karne ke liye ek helper
collection = db.get_collection("covers")

# "notifications" collection ko access karne ke liye helper
notification_collection = db.get_collection("notifications")

# --- NAYI LINE ---
# "categories" collection ko access karne ke liye naya helper
category_collection = db.get_collection("categories")
# --- NAYI LINE ---


async def check_db_connection():
    """
    Ek simple function yeh check karne ke liye ki database connected hai ya nahi.
    """
    try:
        await client.admin.command('ping')
        print(f"Pinged your deployment. You successfully connected to MongoDB (Database: {db.name})!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise