from fastapi import (
    APIRouter, 
    HTTPException, 
    status, 
    Query, 
    Form, 
    UploadFile, 
    File,
    Body,
    Path
)
from typing import List, Optional
from datetime import datetime
import json
from pydantic import BaseModel

# --- NAYA IMPORT ---
from bson import ObjectId # ID ko manually convert karne ke liye
# --- NAYA IMPORT ---

# --- "BEHTREEN" (AWESOME) IMPORT ---
from utils.upload_helper import upload_to_cloudinary
# --- "BEHTREEN" (AWESOME) IMPORT ---

# Database collection
from config.db import collection
# Data models and helper
from models.cover_model import CoverOut, cover_helper, CoverInDB


# --- Update ke liye Pydantic Model (Updated) ---
class CoverUpdate(BaseModel):
    """
    Admin in fields ko kabhi bhi update kar sakta hai.
    """
    modelName: Optional[str] = None
    coverType: Optional[str] = None
    color: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    genderPreference: Optional[str] = None
    tags: Optional[List[str]] = None
    category_ids: Optional[List[str]] = None
    is_available: Optional[bool] = None


# --- YEH ZAROORI HAI ---
router = APIRouter(
    prefix="/api/covers",
    tags=["Covers"]
)
# --- YEH ZAROORI HAI ---


@router.get("/", response_model=List[CoverOut])
async def get_covers(
    model: Optional[str] = Query(None, description="Mobile model name (e.g., iPhone 13)"),
    coverType: Optional[List[str]] = Query(None, description="List of cover types"),
    color: Optional[List[str]] = Query(None, description="List of colors"),
    minPrice: Optional[float] = Query(None, description="Minimum price"),
    maxPrice: Optional[float] = Query(None, description="Maximum price"),
    gender: Optional[str] = Query(None, description="Gender preference (Ladies, Gents, Unisex)"),
    category_ids: Optional[List[str]] = Query(None, description="Filter by category IDs"),
    admin_mode: bool = Query(False, description="Admin mode to see unavailable products")
):
    query: dict = {}

    if model:
        query["modelName"] = {"$regex": model, "$options": "i"}
    if coverType:
        query["coverType"] = {"$in": coverType}
    if color:
        query["color"] = {"$in": color}
    
    price_query = {}
    if minPrice is not None: price_query["$gte"] = minPrice
    if maxPrice is not None: price_query["$lte"] = maxPrice
    if price_query: query["price"] = price_query
        
    if gender and gender.strip():
        query["genderPreference"] = gender
        
    if category_ids:
        query["category_ids"] = {"$in": category_ids}
        
    if not admin_mode:
        query["is_available"] = True

    try:
        covers = []
        async for cover_data in collection.find(query).sort("createdAt", -1):
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
    modelName: str = Form(...),
    coverType: str = Form(...),
    color: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    category_ids: str = Form(..., description="JSON list of category IDs"),
    genderPreference: str = Form("Unisex"),
    tags: Optional[str] = Form("[]"), 
    is_available: bool = Form(True), # Default value True hai
    image: UploadFile = File(...)
):
    try:
        image_url = await upload_to_cloudinary(image)
        
        try:
            tags_list = json.loads(tags) if tags else []
            category_ids_list = json.loads(category_ids)
            if not isinstance(category_ids_list, list): # Empty list allowed hai
                raise ValueError("category_ids must be a list of strings.")
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid format for tags or category_ids: {e}")

        db_cover = CoverInDB(
            modelName=modelName,
            coverType=coverType,
            color=color,
            price=price,
            stock=stock,
            imageUrl=image_url, # Pydantic model HttpUrl mein convert karega
            genderPreference=genderPreference,
            tags=tags_list,
            category_ids=category_ids_list,
            is_available=is_available,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )

        # Hum 'imageUrl' ko string mein convert karke save karenge (HttpUrl error fix)
        insert_data = db_cover.model_dump(by_alias=True)
        insert_data["imageUrl"] = str(db_cover.imageUrl)

        result = await collection.insert_one(insert_data)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert new cover into database."
            )
        
        created_cover = await collection.find_one({"_id": result.inserted_id})
        if created_cover is None:
             raise HTTPException(status_code=404, detail="Newly created cover not found.")

        return cover_helper(created_cover)

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error adding cover: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {e}"
        )


@router.put("/{id}", response_model=CoverOut)
async def update_cover(
    id: str = Path(..., description="Update karne wale cover ka ID (string)"), 
    update_data: CoverUpdate = Body(...)
):


    update_dict = update_data.model_dump(exclude_unset=True) 
    
    if not update_dict:
            raise HTTPException(status_code=400, detail="Update karne ke liye koi data nahi diya gaya.")

    update_dict["updatedAt"] = datetime.utcnow()
    
    update_result = await collection.update_one(
        {"_id": id},
        {"$set": update_dict}
    )
    
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found.")

    updated_doc = await collection.find_one({"_id": id})
    if updated_doc is None:
        raise HTTPException(status_code=404, detail="Updated cover not found after update.")
        
    return cover_helper(updated_doc)


@router.delete("/{id}")
async def delete_cover(
    # --- YEH "BEHTREEN" (AWESOME) FIX HAI ---
    id: str = Path(..., description="Delete karne wale cover ka ID (string)")
    # --- YEH FIX HAI ---
):
    """
    (Admin ke liye) Ek cover ko ID se delete karta hai.
    """
    try:
        # --- YEH FIX HAI ---
        # String ID ko ObjectId mein manually convert karein
        # obj_id = ObjectId(id)
        # --- YEH FIX HAI ---
        pass
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Product ID format.")
        
    delete_result = await collection.delete_one({"_id": id}) # obj_id ka istemal karein
    
    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cover ID '{id}' ke saath nahi mila."
        )
    return

