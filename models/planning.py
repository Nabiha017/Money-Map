from pydantic import BaseModel, Field
from typing import Optional


class BudgetCreate(BaseModel):
    name: str
    amount: float = Field(gt=0)


class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)


class GoalCreate(BaseModel):
    name: str
    amount: float = Field(gt=0)
    saved: float = Field(default=0, ge=0)


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    saved: Optional[float] = Field(default=None, ge=0)