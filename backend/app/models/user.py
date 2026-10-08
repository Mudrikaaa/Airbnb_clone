from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.listing import Listing
    from app.models.review import Review
    from app.models.wishlist import WishlistItem


class User(Base):
    """Any user can be a guest; a user is a 'host' simply by owning listings."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    bio: Mapped[str | None] = mapped_column(Text)
    is_superhost: Mapped[bool] = mapped_column(Boolean, default=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    listings: Mapped[list[Listing]] = relationship(back_populates="host")
    bookings: Mapped[list[Booking]] = relationship(back_populates="guest")
    reviews: Mapped[list[Review]] = relationship(back_populates="author")
    wishlist_items: Mapped[list[WishlistItem]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
