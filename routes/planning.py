from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from database.connection import budgets_collection, goals_collection
from models.planning import BudgetCreate, BudgetUpdate, GoalCreate, GoalUpdate
from routes.auth import get_current_user


router = APIRouter(prefix="/planning", tags=["Planning"])


def serialize_document(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    document.pop("user_id", None)
    return document


def valid_id(value: str, label: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=404, detail=f"{label} not found")
    return ObjectId(value)


def list_documents(collection, user_id):
    return [serialize_document(record) for record in collection.find({"user_id": user_id})]


@router.get("/budgets")
def get_budgets(current_user: dict = Depends(get_current_user)):
    return list_documents(budgets_collection, current_user["_id"])


@router.post("/budgets", status_code=status.HTTP_201_CREATED)
def create_budget(budget: BudgetCreate, current_user: dict = Depends(get_current_user)):
    document = budget.model_dump()
    document["user_id"] = current_user["_id"]
    result = budgets_collection.insert_one(document)
    document["_id"] = result.inserted_id
    return serialize_document(document)


@router.patch("/budgets/{budget_id}")
def update_budget(budget_id: str, budget: BudgetUpdate, current_user: dict = Depends(get_current_user)):
    updates = budget.model_dump(exclude_unset=True, exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No changes provided")
    result = budgets_collection.find_one_and_update(
        {"_id": valid_id(budget_id, "Budget"), "user_id": current_user["_id"]},
        {"$set": updates}, return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Budget not found")
    return serialize_document(result)


@router.delete("/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: str, current_user: dict = Depends(get_current_user)):
    result = budgets_collection.delete_one({"_id": valid_id(budget_id, "Budget"), "user_id": current_user["_id"]})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Budget not found")


@router.get("/goals")
def get_goals(current_user: dict = Depends(get_current_user)):
    return list_documents(goals_collection, current_user["_id"])


@router.post("/goals", status_code=status.HTTP_201_CREATED)
def create_goal(goal: GoalCreate, current_user: dict = Depends(get_current_user)):
    document = goal.model_dump()
    document["user_id"] = current_user["_id"]
    result = goals_collection.insert_one(document)
    document["_id"] = result.inserted_id
    return serialize_document(document)


@router.patch("/goals/{goal_id}")
def update_goal(goal_id: str, goal: GoalUpdate, current_user: dict = Depends(get_current_user)):
    updates = goal.model_dump(exclude_unset=True, exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No changes provided")
    result = goals_collection.find_one_and_update(
        {"_id": valid_id(goal_id, "Goal"), "user_id": current_user["_id"]},
        {"$set": updates}, return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Goal not found")
    return serialize_document(result)


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    result = goals_collection.delete_one({"_id": valid_id(goal_id, "Goal"), "user_id": current_user["_id"]})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Goal not found")
