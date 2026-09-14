from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    description: str = Field(min_length=1, max_length=120)
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=60)
    date: date
    payment_method: Optional[str] = Field(default=None, max_length=60)


class IncomeCreate(BaseModel):
    description: str = Field(min_length=1, max_length=120)
    amount: float = Field(gt=0)
    source: str = Field(min_length=1, max_length=60)
    date: date


class TransactionUpdate(BaseModel):
    description: Optional[str] = Field(default=None, min_length=1, max_length=120)
    amount: Optional[float] = Field(default=None, gt=0)
    category: Optional[str] = Field(default=None, min_length=1, max_length=60)
    source: Optional[str] = Field(default=None, min_length=1, max_length=60)
    date: Optional[date] = None
    payment_method: Optional[str] = Field(default=None, max_length=60)
