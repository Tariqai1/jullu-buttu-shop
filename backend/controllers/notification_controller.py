from fastapi import (
    APIRouter, 
    HTTPException, 
    status, 
    Body,
    Path
)
from typing import List
from datetime import datetime

# --- YEH IMPORT HATA DIYA GAYA HAI ---
# from bson import ObjectId # Hum ab iski zaroorat nahi hai
# --- YEH IMPORT HATA DIYA GAYA HAI ---

# Database collection
from config.db import notification_collection
# Data models and helper
from models.notification_model import (
    NotificationRequest, 
    NotificationOut, 
    notification_helper,
    NotificationInDB,
    NotificationStatusUpdate
)

# Naya router object
router = APIRouter(
    prefix="/api/notify",
    tags=["Notifications"]
)

@router.post("/", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
async def create_notification(
    request: NotificationRequest = Body(...)
):
    try:
        db_request = NotificationInDB(
            **request.model_dump(),
            createdAt=datetime.utcnow(),
            status="Pending"
        )
        
        insert_data = db_request.model_dump(by_alias=True)
        
        # --- "BEHTREEN" (AWESOME) FIX ---
        # Humne Pydantic ko PyObjectId ko string mein convert karne se roka
        # Hum 'id' (jo PyObjectId hai) ko pehle string mein convert karenge
        # Phir 'insert_data' (dictionary) mein '_id' key ke roop mein save karenge
        # (Aapke database dump ke anusaar, aap string IDs save kar rahe hain)
        if 'id' in insert_data:
             insert_data['_id'] = str(insert_data.pop('id'))
        # --- END OF FIX ---

        result = await notification_collection.insert_one(insert_data)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create notification request."
            )
        
        created_doc = await notification_collection.find_one({"_id": result.inserted_id})
        if created_doc is None:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Newly created notification not found."
            )

        return notification_helper(created_doc)
        
    except Exception as e:
        print(f"Error creating notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {e}"
        )


@router.get("/", response_model=List[NotificationOut])
async def get_all_notifications():
    """
    (Admin ke liye) Sabhi notification requests fetch karta hai.
    """
    try:
        notifications = []
        async for doc in notification_collection.find().sort("createdAt", -1):
            notifications.append(notification_helper(doc))
        return notifications
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {e}"
        )

# --- NAYA "BEHTREEN" (AWESOME) ENDPOINT (FIXED) ---
@router.put("/{id}", response_model=NotificationOut)
async def update_notification_status(
    id: str = Path(..., description="Notification ID (string)"),
    status_update: NotificationStatusUpdate = Body(...)
):
    """
    (Admin ke liye) Ek notification ka status update karta hai (e.g., 'Completed').
    """
    
    # --- "BEHTREEN" (AWESOME) FIX ---
    # Hum 'ObjectId(id)' ka istemal *NAHI* kar rahe hain.
    # Hum 'id' (string) ka istemal kar rahe hain, kyunki aapka database ID ko string ke roop mein save kar raha hai.
    
    update_data = status_update.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Update karne ke liye koi data nahi diya gaya.")

    update_result = await notification_collection.update_one(
        {"_id": id}, # ID ko string ki tarah hi dhoondho
        {"$set": update_data}
    )
    # --- END OF FIX ---
    
    if update_result.matched_count == 0:
        # Debugging ke liye print statement
        print(f"[DEBUG] 404: Notification ID (string) '{id}' database mein nahi mila.")
        raise HTTPException(status_code=404, detail="Notification not found.")

    updated_doc = await notification_collection.find_one({"_id": id}) # ID ko string ki tarah hi dhoondho
    if updated_doc is None:
        raise HTTPException(status_code=404, detail="Updated notification not found after update.")
        
    return notification_helper(updated_doc)
# --- NAYA ENDPOINT (FIXED) ---

