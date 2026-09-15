import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "moneymap")
SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://nabiha017.github.io/Money-Map"
)