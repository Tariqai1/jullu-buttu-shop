import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys

# --- "BEHTREEN" (AWESOME) 100% FIX ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=env_path)
sys.path.append(BASE_DIR)
# --- END OF FIX ---

# Hamare banaye gaye modules ko import karna
from routes.cover_routes import cover_router
from controllers.notification_controller import router as notification_router
from controllers.category_controller import router as category_router
from controllers.auth_controller import router as auth_router
from config.db import check_db_connection
from config.cloudinary_config import setup_cloudinary

# FastAPI app instance banana
app = FastAPI(
    title="Mobile Cover Shop API",
    description="API for managing and fetching mobile covers.",
    version="1.0.0"
)

# --- "BEHTREEN" (AWESOME) CORS UPDATE ---
# Hum yahaan apne dono URLs daalenge
allowed_origins = [
    # --- Yahaan APNA VERCEL URL PASTE KAREIN ---
    "https" 
    # Example: "https://jullu-buttu-shop.vercel.app", 
    # --- Yahaan APNA VERCEL URL PASTE KAREIN ---

    "http://localhost:5173",  # Aapka local React app
    "http://127.0.0.1:5173", # Local development (alternative)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, # Sirf in URLs ko allow karein
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
# --- END OF CORS UPDATE ---

# --- Event Handlers (Startup) ---
@app.on_event("startup")
async def startup_event():
    print("Application startup...")
    setup_cloudinary()
    await check_db_connection()

# --- API Routes ko include karna ---
app.include_router(cover_router)
app.include_router(notification_router)
app.include_router(category_router)
app.include_router(auth_router)


# --- Root Endpoint (Health Check) ---
@app.get("/", tags=["Health Check"])
async def read_root():
    return {"status": "success", "message": "Welcome to Mobile Cover Shop API!"}

# --- Server ko run karne ke liye (Updated for Render) ---
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Uvicorn server on 0.0.0.0:{port}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
