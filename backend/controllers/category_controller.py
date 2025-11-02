from fastapi import (
    APIRouter, 
    HTTPException, 
    status, 
    Body,
    Path
)
from typing import List

# Database collection
from config.db import category_collection
# Data models and helper
from models.category_model import (
    CategoryBase, 
    CategoryOut, 
    category_helper,
    CategoryInDB
)
# Valid ObjectId ke liye
from models.cover_model import PyObjectId
from datetime import datetime

# Naya router object
router = APIRouter(
    prefix="/api/categories", # Sabhi routes /api/categories se shuru honge
    tags=["Categories"]       # Documentation mein alag group
)

@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryBase = Body(...)
):
    """
    Ek nayi category (jaise "Silicone Cases") banata hai.
    """
    try:
        # Check karein ki category pehle se exist to nahi karti
        existing_category = await category_collection.find_one({"name": category.name})
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{category.name}' pehle se maujood hai."
            )
        
        # Pydantic model ko database-ready model mein convert karna
        db_category = CategoryInDB(
            **category.model_dump(),
            createdAt=datetime.utcnow()
        )
        
        insert_data = db_category.model_dump(by_alias=True)
        result = await category_collection.insert_one(insert_data)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Category banane mein fail hua."
            )
        
        created_doc = await category_collection.find_one({"_id": result.inserted_id})
        if created_doc is None:
            raise HTTPException(status_code=404, detail="Category banayi nahi ja saki.")
            
        return category_helper(created_doc)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating category: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {e}"
        )


@router.get("/", response_model=List[CategoryOut])
async def get_all_categories():
    """
    (Admin ke liye) Sabhi banayi gayi categories ki list fetch karta hai.
    """
    try:
        categories = []
        async for doc in category_collection.find():
            categories.append(category_helper(doc))
        return categories
    except Exception as e:
        print(f"Error fetching categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {e}"
        )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    id: PyObjectId = Path(..., description="Delete karne wali category ka ID")
):
    """
    (Admin ke liye) Ek specific category ko ID se delete karta hai.
    """
    try:
        delete_result = await category_collection.delete_one({"_id": id})
        
        if delete_result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category ID '{id}' ke saath nahi mili."
            )
        
        # HTTP 204 (No Content) return karega, jo success maana jaata hai
        return
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error deleting category: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {e}"
        )