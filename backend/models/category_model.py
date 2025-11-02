from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# Hamari custom PyObjectId class ko import karna
from .cover_model import PyObjectId 

class CategoryBase(BaseModel):
    """
    Data jo user se API ke through aayega.
    """
    name: str = Field(..., example="Silicone Cases")
    description: Optional[str] = Field(None, example="Soft and flexible silicone cases")

class CategoryInDB(CategoryBase):
    """
    Data jo MongoDB mein save hoga.
    """
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class CategoryOut(CategoryBase):
    """
    Data jo hum API response mein wapas bhejenge.
    """
    id: str = Field(..., example="605c72ef8f0b9f001f7b0e0a")
    createdAt: datetime

    model_config = ConfigDict(
        json_encoders={datetime: lambda v: v.isoformat()}
    )


def category_helper(data) -> CategoryOut:
    """MongoDB document ko CategoryOut model mein convert karta hai."""
    return CategoryOut(
        id=str(data["_id"]),
        name=data["name"],
        description=data.get("description"),
        createdAt=data["createdAt"]
    )