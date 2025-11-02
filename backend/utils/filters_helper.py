from fastapi import (
    APIRouter, 
    HTTPException, 
    status, 
    Query, 
    Form, 
    UploadFile, 
    File,
    Depends
)
from typing import List, Optional

# Database collection
from config.db import collection
# Data model and helper
from models.cover_model import CoverOut, cover_helper
# Cloudinary upload utility
from utils.upload_helper import upload_to_cloudinary
# JSON encoding for price/stock
import json

# Ek naya router object bana rahe hain
router = APIRouter(
    prefix="/api/covers", # Sabhi routes /api/covers se shuru honge
    tags=["Covers"]       # Documentation mein "Covers" group ke andar aayega
)

@router.get("/", response_model=List[CoverOut])
async def get_covers(
    model: Optional[str] = Query(None, description="Mobile model name (e.g., iPhone 13)"),
    coverType: Optional[List[str]] = Query(None, description="List of cover types"),
    color: Optional[List[str]] = Query(None, description="List of colors"),
    minPrice: Optional[float] = Query(None, description="Minimum price"),
    maxPrice: Optional[float] = Query(None, description="Maximum price"),
    gender: Optional[str] = Query(None, description="Gender preference (Ladies, Gents, Unisex)")
):
    """
    Filters ke basis par sabhi mobile covers fetch karta hai.
    """
    query: dict = {}

    # 1. Model Name Filter (Case-insensitive fuzzy search)
    if model:
        # 'i' flag case-insensitivity ke liye hai
        query["modelName"] = {"$regex": model, "$options": "i"}

    # 2. Cover Type Filter (Agar multiple types select kiye hain)
    if coverType:
        query["coverType"] = {"$in": coverType}

    # 3. Color Filter (Agar multiple colors select kiye hain)
    if color:
        query["color"] = {"$in": color}

    # 4. Price Range Filter
    price_query = {}
    if minPrice is not None:
        price_query["$gte"] = minPrice
    if maxPrice is not None:
        price_query["$lte"] = maxPrice
    if price_query:
        query["price"] = price_query

    # 5. Gender Preference Filter
    # Agar gender specify kiya hai (aur woh empty string nahi hai), tabhi filter lagao
    if gender and gender.strip():
        query["genderPreference"] = gender

    try:
        covers = []
        # 'collection.find(query)' database se match hone wale sabhi documents dhoondhta hai
        async for cover_data in collection.find(query):
            covers.append(cover_helper(cover_data))
        
        return covers
    
    except Exception as e:
        print(f"Error fetching covers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching covers: {e}"
        )


@router.post("/", response_model=CoverOut, status_code=status.HTTP_201_CREATED)
async def add_cover(
    # Hum Form(...) ka istemal kar rahe hain kyunki yeh multipart/form-data hai
    modelName: str = Form(...),
    coverType: str = Form(...),
    color: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    genderPreference: str = Form("Unisex"),
    tags: Optional[str] = Form("[]"), # Tags ko JSON string ke roop mein bhejenge
    image: UploadFile = File(...)
):
    """
    Ek naya cover (image ke saath) database mein add karta hai.
    """
    try:
        # 1. Image ko Cloudinary par upload karna
        image_url = await upload_to_cloudinary(image)
        
        # Tags string (e.g., '["New", "Matte"]') ko Python list mein convert karna
        try:
            tags_list = json.loads(tags)
        except json.JSONDecodeError:
            tags_list = [] # Agar galat format hai to empty list

        # 2. Naya cover data dictionary banana
        new_cover_data = {
            "modelName": modelName,
            "coverType": coverType,
            "color": color,
            "price": price,
            "stock": stock,
            "imageUrl": image_url,
            "genderPreference": genderPreference,
            "tags": tags_list
        }

        # 3. Data ko MongoDB mein insert karna
        result = await collection.insert_one(new_cover_data)
        
        # Check karna ki insert successful hua ya nahi
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert new cover into database."
            )
        
        # 4. Naya create hua document database se fetch karna
        created_cover = await collection.find_one({"_id": result.inserted_id})
        
        if created_cover is None:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Newly created cover not found."
            )

        # 5. Document ko Pydantic model mein convert karke return karna
        return cover_helper(created_cover)

    except HTTPException as e:
        # HTTP exceptions ko seedha raise karna
        raise e
    except Exception as e:
        # Doosre errors ko handle karna
        print(f"Error adding cover: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while adding the cover: {e}"
        )