from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20, max_length=512)
    new_password: str = Field(min_length=6, max_length=256)


class PasswordChangeRequest(BaseModel):
    new_password: str = Field(min_length=6, max_length=256)


class LocalPasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=6, max_length=256)


class UserProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    currency: str = Field(default="INR", pattern="^(INR|USD|EUR)$")
