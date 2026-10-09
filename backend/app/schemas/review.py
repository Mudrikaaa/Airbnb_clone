from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserSummary


class ReviewAuthor(UserSummary):
    joined_at: datetime  # Airbnb shows "N years on Airbnb" under the reviewer's name


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rating: int
    cleanliness: int | None
    accuracy: int | None
    check_in: int | None
    communication: int | None
    location: int | None
    value: int | None
    comment: str
    created_at: datetime
    author: ReviewAuthor


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    # Optional category ratings, 1-5 each.
    cleanliness: int | None = Field(None, ge=1, le=5)
    accuracy: int | None = Field(None, ge=1, le=5)
    check_in: int | None = Field(None, ge=1, le=5)
    communication: int | None = Field(None, ge=1, le=5)
    location: int | None = Field(None, ge=1, le=5)
    value: int | None = Field(None, ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)
