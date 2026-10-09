"""Reviews and rating aggregation.

Ratings are computed from the reviews table on read (never stored on listings), so they can't
drift out of sync. At this scale an AVG/COUNT over an indexed column is cheap; a large site would
cache them on the listing and update on each new review.
"""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.sql import Subquery

from app.errors import ConflictError, ForbiddenError, NotFoundError
from app.models import BOOKING_CONFIRMED, Booking, Listing, Review, User
from app.models.review import CATEGORY_FIELDS
from app.schemas.review import ReviewCreate


def rating_stats_subquery() -> Subquery:
    """One row per reviewed listing: (listing_id, avg_rating, review_count). Outer-join it onto listings."""
    return (
        select(
            Review.listing_id,
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count"),
        )
        .group_by(Review.listing_id)
        .subquery()
    )


def rating_summary(db: Session, listing_id: int) -> tuple[float | None, int, dict[str, float | None]]:
    """Overall average, review count and the six category averages, all in one query.
    AVG skips NULLs, so reviews without category ratings don't drag a category down."""
    row = db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id),
            *(func.avg(getattr(Review, f)) for f in CATEGORY_FIELDS),
        ).where(Review.listing_id == listing_id)
    ).one()
    rounded = [round(v, 2) if v is not None else None for v in row]
    return rounded[0], row[1], dict(zip(CATEGORY_FIELDS, rounded[2:]))


def list_reviews(db: Session, listing_id: int) -> list[Review]:
    if db.get(Listing, listing_id) is None:
        raise NotFoundError("Listing not found")
    return list(
        db.scalars(
            select(Review)
            .where(Review.listing_id == listing_id)
            .options(selectinload(Review.author))  # avoid one author query per review
            .order_by(Review.created_at.desc())
        )
    )


def create_review(db: Session, author: User, listing_id: int, data: ReviewCreate) -> Review:
    booking = db.get(Booking, data.booking_id)
    if booking is None or booking.listing_id != listing_id:
        raise NotFoundError("Booking not found for this listing")
    if booking.guest_id != author.id:
        raise ForbiddenError("You can only review your own stays")
    if booking.status != BOOKING_CONFIRMED or booking.check_out > date.today():
        raise ForbiddenError("You can review a stay once you've checked out")
    if booking.review is not None:
        raise ConflictError("You've already reviewed this stay")

    review = Review(listing_id=listing_id, author=author, booking=booking, **data.model_dump(exclude={"booking_id"}))
    db.add(review)
    try:
        db.commit()
    except IntegrityError:  # unique booking_id: a concurrent duplicate slipped past the check above
        db.rollback()
        raise ConflictError("You've already reviewed this stay") from None
    db.refresh(review)
    return review
