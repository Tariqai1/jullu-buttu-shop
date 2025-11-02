import os
from fastapi import (
    APIRouter, 
    HTTPException, 
    status, 
    Body,
    Depends
)
# HTTP Basic Auth ke liye (optional, lekin achha hai)
from fastapi.security import OAuth2PasswordRequestForm

# Data models
from models.auth_model import AdminLoginSchema, AuthSuccessResponse

# Naya router object
router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"] # Documentation mein alag group
)

# --- "Behtreen" (Awesome) Admin Credentials ---
# Hum credentials ko .env file se load kar rahe hain
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password")
# ------------------------------------------

@router.post("/login", response_model=AuthSuccessResponse)
async def login_admin(
    form_data: AdminLoginSchema = Body(...)
):
    """
    Admin ko login karta hai.
    """
    
    # Check karein ki username aur password match ho rahe hain ya nahi
    if form_data.username != ADMIN_USERNAME or form_data.password != ADMIN_PASSWORD:
        print(f"[Auth] Failed login attempt for username: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Agar login successful hai
    print(f"[Auth] Successful login for username: {form_data.username}")
    return AuthSuccessResponse(username=form_data.username)

