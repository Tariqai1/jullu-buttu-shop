from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from typing import Literal # Naya import

# Hamari custom PyObjectId class ko import karna
from .cover_model import PyObjectId 

# --- Naya "Behtreen" (Awesome) Feature: Status ke liye options ---
# Hum 'Literal' ka istemal karenge taaki status sirf in 4 values mein se ek ho sake
NotificationStatus = Literal["Pending", "In Progress", "Completed", "Cancelled"]
# --- End of Feature ---

class NotificationRequest(BaseModel):
    """
    Data jo user se API ke through aayega.
    """
    phone: str = Field(..., example="9876543210", min_length=10, max_length=15)
    modelName: str = Field(..., example="Samsung A15")

class NotificationInDB(NotificationRequest):
    """
    Data jo MongoDB mein save hoga.
    """
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    
    # --- YEH BADLA HAI ---
    # Hum 'notified: bool' ko 'status: str' se badal rahe hain
    status: NotificationStatus = Field(default="Pending") # Default value 'Pending'
    # --- YEH BADLA HAI ---

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

# --- Naya Model (Status Update ke liye) ---
class NotificationStatusUpdate(BaseModel):
    """
    Yeh model sirf 'status' field ko update karne ke liye hai.
    """
    status: NotificationStatus
# --- Naya Model ---

class NotificationOut(NotificationInDB):
    """
    Data jo hum API response mein wapas bhejenge.
    """
    # ID ko string mein convert karna
    id: str = Field(..., example="605c72ef8f0b9f001f7b0e0a")

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str, datetime: lambda v: v.isoformat()} # Dates ko ISO format mein convert karna
    )

def notification_helper(data) -> NotificationOut:
    """MongoDB document ko NotificationOut model mein convert karta hai."""
    return NotificationOut(
        id=str(data["_id"]),
        phone=data["phone"],
        modelName=data["modelName"],
        createdAt=data["createdAt"],
        # --- YEH BADLA HAI ---
        status=data.get("status", "Pending") # Purane data ke liye fallback
        # --- YEH BADLA HAI ---
    )

