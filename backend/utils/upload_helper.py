import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status
from typing import Dict, Any

async def upload_to_cloudinary(file: UploadFile) -> str:
    """
    File (image) ko Cloudinary par upload karta hai aur uska secure URL return karta hai.
    """
    try:
        # File ko Cloudinary par upload karna
        # Humne ek 'mobile_covers' folder specify kiya hai taaki sab saaf-suthra rahe
        upload_result: Dict[str, Any] = cloudinary.uploader.upload(
            file.file, 
            folder="mobile_covers",
            resource_type="image"
        )
        
        # Upload se mila 'secure_url' (HTTPS URL) return karna
        secure_url = upload_result.get("secure_url")
        if not secure_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Cloudinary upload failed: No secure URL returned."
            )
            
        return secure_url

    except Exception as e:
        # Agar koi error aaye (jaise credentials galat hain)
        print(f"Cloudinary upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during file upload: {e}"
        )