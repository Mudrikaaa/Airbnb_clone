from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.listing import Listing
    from app.models.user import User


# Airbnb's six category ratings. Nullable: older reviews (and guests who skip them) have none.
CATEGORY_FIELDS = ("cleanliness", "accuracy", "check_in", "communication", "location", "value")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating"),
        *(CheckConstraint(f"{f} BETWEEN 1 AND 5", name=f"ck_reviews_{f}") for f in CATEGORY_FIELDS),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # Unique => at most one review per stay. Nullable so the column doesn't block non-booking reviews.
    booking_id: Mapped[int | None] = mapped_column(ForeignKey("bookings.id"), unique=True)
    rating: Mapped[int] = mapped_column(Integer)
    cleanliness: Mapped[int | None] = mapped_column(Integer)
    accuracy: Mapped[int | None] = mapped_column(Integer)
    check_in: Mapped[int | None] = mapped_column(Integer)
    communication: Mapped[int | None] = mapped_column(Integer)
    location: Mapped[int | None] = mapped_column(Integer)
    value: Mapped[int | None] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    listing: Mapped[Listing] = relationship(back_populates="reviews")
    author: Mapped[User] = relationship(back_populates="reviews")
    booking: Mapped[Booking | None] = relationship(back_populates="review")
