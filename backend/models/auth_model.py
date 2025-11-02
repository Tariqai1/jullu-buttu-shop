from pydantic import BaseModel, Field

class AdminLoginSchema(BaseModel):
    """
    Login form se aane wala data.
    """
    username: str = Field(..., example="admin")
    password: str = Field(..., example="password123")

class AuthSuccessResponse(BaseModel):
    """
    Successful login par response.
    """
    message: str = "Login Successful"
    username: str
    # Future mein hum yahaan 'token' bhej sakte hain
