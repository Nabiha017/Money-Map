from routes.verification import router as verification_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from configurations import FRONTEND_URL
from database.connection import test_database_connection
from routes.auth import router as auth_router
from routes.transactions import router as transactions_router
from routes.planning import router as planning_router


app = FastAPI(title="MoneyMap API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(verification_router)
app.include_router(transactions_router)
app.include_router(planning_router)


@app.exception_handler(PyMongoError)
async def mongodb_error_handler(_, __):
    # Keep database outages distinct from authentication and validation failures.
    return JSONResponse(
        status_code=503,
        content={"detail": "Database is temporarily unavailable. Please try again shortly."},
    )


@app.get("/")
def root():
    return {
        "message": "MoneyMap API is running"
    }


@app.get("/health")
def health():
    if test_database_connection():
        return {
            "status": "healthy",
            "database": "MongoDB connected"
        }

    return JSONResponse(
        status_code=503,
        content={"status": "error", "database": "MongoDB connection failed"},
    )
