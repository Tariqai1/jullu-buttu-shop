from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from typing import Optional, List, Any
from bson import ObjectId
from pydantic_core import core_schema
from pydantic.json_schema import JsonSchemaValue
from datetime import datetime

# --- Pydantic v2 ke liye Final Updated ObjectId Handling ---
class PyObjectId(ObjectId):
    """ Custom Type for MongoDB's ObjectId. """
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler
    ) -> core_schema.CoreSchema:
        def validate(v: Any) -> ObjectId:
            """Validate karta hai ki value ek ObjectId hai ya valid string hai."""
            if isinstance(v, ObjectId):
                return v
            if ObjectId.is_valid(v):
                return ObjectId(v)
            raise ValueError("Invalid ObjectId")

        validator_schema = core_schema.no_info_plain_validator_function(validate)

        return core_schema.json_or_python_schema(
            # JSON se data aane par (hamesha string hoga)
            json_schema=validator_schema,
            # Python se data aane par (string ya ObjectId ho sakta hai)
            python_schema=validator_schema,
            # Jab Python object ko JSON mein badalna ho (serialization)
            serialization=core_schema.plain_serializer_function_ser_schema(lambda x: str(x)),
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: core_schema.CoreSchema, handler
    ) -> JsonSchemaValue:
        """
        JSON Schema ko update karke batata hai ki yeh ek string hai.
        """
        return {'type': 'string'}

# --- Base Model (Updated) ---
class CoverBase(BaseModel):
    modelName: str = Field(..., example="iPhone 13")
    coverType: str = Field(..., example="Silicone")
    color: str = Field(..., example="Midnight Black")
    price: float = Field(..., gt=0, example=499.99)
    stock: int = Field(..., ge=0, example=50)
    genderPreference: Optional[str] = Field("Unisex", example="Ladies")
    tags: Optional[List[str]] = Field([], example=["New Arrival", "Matte Finish"])
    
    # --- YEH BADLA HAI ---
    # Humne 'min_length=1' ko hata diya hai taaki purane products (khaali list ke saath)
    # bhi load ho sakein. Humne default value '[]' (khaali list) set kar di hai.
    category_ids: List[str] = Field([], example=["605c72ef8f0b9f001f7b0e0a"])
    # --- YEH BADLA HAI ---
    
    is_available: bool = Field(default=True)

# --- Model for Data in Database ---
class CoverInDB(CoverBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    imageUrl: HttpUrl = Field(..., example="http://res.cloudinary.com/demo/image/upload/sample.jpg")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

# --- Model for Sending Data to Client (Response) ---
class CoverOut(CoverBase):
    id: str = Field(..., example="605c72ef8f0b9f001f7b0e0a")
    imageUrl: HttpUrl = Field(..., example="http://res.cloudinary.com/demo/image/upload/sample.jpg")
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(
        json_encoders={datetime: lambda v: v.isoformat()}
    )


# --- Helper Function (Updated) ---
def cover_helper(cover_data) -> CoverOut:
    """MongoDB document ko CoverOut Pydantic model mein convert karta hai."""
    
    # --- YEH "BEHTREEN" (AWESOME) FIX HAI ---
    # Purane data ko handle karne ke liye .get() ka istemal
    # Taaki agar koi field na mile to app crash na ho
    now = datetime.utcnow() 
    return CoverOut(
        id=str(cover_data["_id"]),
        modelName=cover_data["modelName"],
        coverType=cover_data["coverType"],
        color=cover_data["color"],
        price=cover_data["price"],
        stock=cover_data["stock"],
        imageUrl=cover_data["imageUrl"],
        genderPreference=cover_data.get("genderPreference", "Unisex"), 
        tags=cover_data.get("tags", []),
        
        # In 3 lines ko .get() istemal karne ke liye update kiya gaya hai
        category_ids=cover_data.get("category_ids", []), # Purane data ke liye fallback
        createdAt=cover_data.get("createdAt", now), # .get() add kiya
        updatedAt=cover_data.get("updatedAt", now),  # .get() add kiya
        is_available=cover_data.get("is_available", True) # .get() add kiya
    )
    # --- END OF FIX ---

