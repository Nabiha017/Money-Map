import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone

import resend
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pwdlib import PasswordHash

from models.user import ForgotPasswordRequest, LocalPasswordResetRequest, PasswordChangeRequest, ResetPasswordRequest, UserCreate, UserLogin, UserProfileUpdate
from database.connection import users_collection
from configurations import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, FRONTEND_URL, SECRET_KEY


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

password_hash = PasswordHash.recommended()
security = HTTPBearer()

resend.api_key = os.getenv("RESEND_API_KEY")

PASSWORD_RESET_RESPONSE = {
    "success": True,
    "message": "If an account exists for that email, a password-reset link has been requested.",
}


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(email: str) -> str:
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="Server authentication is not configured")

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": email, "exp": expires_at}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="Server authentication is not configured")

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        email = None

    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def serialize_profile(user: dict) -> dict:
    return {
        "name": user["name"],
        "email": user["email"],
        "currency": user.get("currency", "INR"),
        "member_since": user.get("created_at", user["_id"].generation_time).isoformat(),
    }


@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    return serialize_profile(current_user)


@router.patch("/me")
def update_profile(
    changes: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"name": changes.name.strip(), "currency": changes.currency}},
    )
    current_user["name"] = changes.name.strip()
    current_user["currency"] = changes.currency
    return serialize_profile(current_user)


@router.post("/change-password")
def change_password(
    request: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
):
    """A logged-in user can set a new password without entering the old one."""
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": password_hash.hash(request.new_password)}},
    )
    return {"success": True, "message": "Password changed successfully"}


@router.post("/dev-reset-password")
def local_password_reset(request: LocalPasswordResetRequest):
    """Localhost-only convenience reset; never enabled for a deployed frontend."""
    enabled = os.getenv("ALLOW_INSECURE_LOCAL_PASSWORD_RESET", "true").lower() == "true"
    if not enabled or not FRONTEND_URL.startswith("http://localhost"):
        raise HTTPException(status_code=403, detail="Local password reset is disabled")

    user = users_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="No account was found for that email")

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": password_hash.hash(request.new_password)},
         "$unset": {"password_reset_token_hash": "", "password_reset_expires": ""}},
    )
    return {"success": True, "message": "Password reset successfully. You can now sign in."}


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    """Always return the same response to avoid revealing registered emails."""
    user = users_collection.find_one({"email": request.email})
    if not user:
        return PASSWORD_RESET_RESPONSE

    token = secrets.token_urlsafe(32)
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_reset_token_hash": token_digest(token),
            "password_reset_expires": datetime.now(timezone.utc) + timedelta(minutes=30),
        }},
    )
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    try:
        if not os.getenv("RESEND_API_KEY"):
            raise RuntimeError("RESEND_API_KEY is not configured")
        resend.Emails.send({
            "from": "MoneyMap <onboarding@resend.dev>",
            "to": [user["email"]],
            "subject": "Reset your MoneyMap password",
            "html": f"""<h2>Reset your MoneyMap password</h2>
                <p>We received a request to reset your password.</p>
                <p><a href=\"{reset_link}\">Reset my password</a></p>
                <p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>""",
        })
    except Exception:
        # Keep delivery failures and account existence private from callers and logs.
        pass
    return PASSWORD_RESET_RESPONSE


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    user = users_collection.find_one({"password_reset_token_hash": token_digest(request.token)})
    if not user:
        raise HTTPException(status_code=400, detail="This password-reset link is invalid or has already been used")

    expires_at = user.get("password_reset_expires")
    if not expires_at or expires_at < datetime.now(timezone.utc):
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$unset": {"password_reset_token_hash": "", "password_reset_expires": ""}},
        )
        raise HTTPException(status_code=400, detail="This password-reset link has expired")

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": password_hash.hash(request.new_password)},
         "$unset": {"password_reset_token_hash": "", "password_reset_expires": ""}},
    )
    return {"success": True, "message": "Password reset successfully. You can now sign in."}


# =========================
# REGISTER
# =========================

@router.post("/register")
def register(user: UserCreate):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = password_hash.hash(
        user.password
    )

    verification_token = secrets.token_urlsafe(32)

    verification_expires = (
        datetime.now(timezone.utc)
        + timedelta(minutes=30)
    )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "verified": False,
        "currency": "INR",
        "created_at": datetime.now(timezone.utc),
        "verification_token": verification_token,
        "verification_expires": verification_expires
    }

    users_collection.insert_one(new_user)

    verification_link = (
        f"{FRONTEND_URL}/verify-email"
        f"?token={verification_token}"
    )

    try:
        resend.Emails.send({
            "from": "MoneyMap <onboarding@resend.dev>",
            "to": [user.email],
            "subject": "Verify your MoneyMap account",
            "html": f"""
                <h2>Welcome to MoneyMap!</h2>

                <p>
                    Your MoneyMap account has been
                    created successfully.
                </p>

                <p>
                    You can use MoneyMap even before
                    verification.
                </p>

                <p>
                    Click below to verify your email:
                </p>

                <p>
                    <a href="{verification_link}">
                        Verify My Email
                    </a>
                </p>

                <p>
                    This link expires in 30 minutes.
                </p>
            """
        })

    except Exception as error:
        print(
            "Verification email could not be sent:",
            error
        )

    return {
        "success": True,
        "message": "Account created successfully",
        "verified": False
    }


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(user: UserLogin):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_correct = password_hash.verify(
        user.password,
        existing_user["password"]
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "success": True,
        "message": "Login successful",
        "access_token": create_access_token(existing_user["email"]),
        "token_type": "bearer",
        "verified": existing_user.get(
            "verified",
            False
        ),
        "user": {
            "name": existing_user["name"],
            "email": existing_user["email"]
        }
    }
