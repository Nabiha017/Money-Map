from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from database.connection import expenses_collection, income_collection
from models.finance import ExpenseCreate, IncomeCreate, TransactionUpdate
from routes.auth import get_current_user


router = APIRouter(prefix="/transactions", tags=["Transactions"])


def serialize_transaction(transaction: dict) -> dict:
    transaction["id"] = str(transaction.pop("_id"))
    transaction.pop("user_id", None)
    return transaction


def get_collection(transaction_type: str):
    if transaction_type == "expenses":
        return expenses_collection
    if transaction_type == "income":
        return income_collection
    raise HTTPException(status_code=404, detail="Unknown transaction type")


@router.get("/{transaction_type}")
def list_transactions(
    transaction_type: str,
    current_user: dict = Depends(get_current_user),
):
    collection = get_collection(transaction_type)
    records = collection.find({"user_id": current_user["_id"]}).sort("date", -1)
    return [serialize_transaction(record) for record in records]


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    current_user: dict = Depends(get_current_user),
):
    record = expense.model_dump(mode="json")
    record.update({"user_id": current_user["_id"], "created_at": datetime.now(timezone.utc)})
    result = expenses_collection.insert_one(record)
    record["_id"] = result.inserted_id
    return serialize_transaction(record)


@router.post("/income", status_code=status.HTTP_201_CREATED)
def create_income(
    income: IncomeCreate,
    current_user: dict = Depends(get_current_user),
):
    record = income.model_dump(mode="json")
    record.update({"user_id": current_user["_id"], "created_at": datetime.now(timezone.utc)})
    result = income_collection.insert_one(record)
    record["_id"] = result.inserted_id
    return serialize_transaction(record)


@router.patch("/{transaction_type}/{transaction_id}")
def update_transaction(
    transaction_type: str,
    transaction_id: str,
    changes: TransactionUpdate,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(transaction_id):
        raise HTTPException(status_code=404, detail="Transaction not found")

    collection = get_collection(transaction_type)
    update_data = changes.model_dump(exclude_unset=True, mode="json")
    if transaction_type == "expenses":
        update_data.pop("source", None)
    else:
        update_data.pop("category", None)
        update_data.pop("payment_method", None)

    if not update_data:
        raise HTTPException(status_code=400, detail="No changes provided")

    record = collection.find_one_and_update(
        {"_id": ObjectId(transaction_id), "user_id": current_user["_id"]},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return serialize_transaction(record)


@router.delete("/{transaction_type}/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_type: str,
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(transaction_id):
        raise HTTPException(status_code=404, detail="Transaction not found")
    collection = get_collection(transaction_type)
    result = collection.delete_one({"_id": ObjectId(transaction_id), "user_id": current_user["_id"]})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Transaction not found")
