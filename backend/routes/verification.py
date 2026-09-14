import os
import secrets
from datetime import datetime, timedelta, timezone

import resend
from fastapi import APIRouter, HTTPException

from database.connection import users_collection
from configurations import FRONTEND_URL

router = APIRouter(
    prefix="/verification",
    tags=["Email Verification"]
)

resend.api_key = os.getenv("RESEND_API_KEY")


@router.post("/send/{email}")
def send_verification_email(email: str):

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    token = secrets.token_urlsafe(32)

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "verification_token": token,
                "verification_expires": expires_at
            }
        }
    )

    verification_link = (
        f"{FRONTEND_URL}/verify-email?token={token}"
    )

    resend.Emails.send({
        "from": "MoneyMap <onboarding@resend.dev>",
        "to": [email],
        "subject": "Verify your MoneyMap account",
        "html": f"""
            <h2>Welcome to MoneyMap!</h2>

            <p>Please verify your email address to activate your account.</p>

            <p>
                <a href="{verification_link}">
                    Verify My Email
                </a>
            </p>

            <p>This link expires in 30 minutes.</p>
        """
    })

    return {
        "success": True,
        "message": "Verification email sent"
    }


@router.get("/verify/{token}")
def verify_email(token: str):

    user = users_collection.find_one({
        "verification_token": token
    })

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token"
        )

    expires_at = user.get("verification_expires")

    if not expires_at or expires_at < datetime.now(timezone.utc):
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$unset": {"verification_token": "", "verification_expires": ""}},
        )
        raise HTTPException(
            status_code=400,
            detail="Verification link has expired"
        )

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "verified": True
            },
            "$unset": {
                "verification_token": "",
                "verification_expires": ""
            }
        }
    )

    return {
        "success": True,
        "message": "Email verified successfully"
    }
