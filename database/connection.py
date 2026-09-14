import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError
import certifi


load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "moneymap"
)


client = MongoClient(
    MONGODB_URL,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    socketTimeoutMS=10000,
    retryReads=True,
    retryWrites=True,
    appname="MoneyMap",
)


db = client[DATABASE_NAME]

users_collection = db["users"]
expenses_collection = db["expenses"]
income_collection = db["income"]
budgets_collection = db["budgets"]
goals_collection = db["goals"]


def test_database_connection():
    try:
        # A ping alone may succeed before a real collection operation fails.
        client.admin.command("ping")
        users_collection.find_one({}, projection={"_id": 1}, max_time_ms=5000)
        return True
    except PyMongoError:
        return False
