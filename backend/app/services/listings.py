"""Listing detail, quotes and host-side create / update / delete."""

from datetime import date

from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.errors import ConflictError, ForbiddenError, InvalidRequestError, NotFoundError
from app.models import BOOKING_CONFIRMED, Amenity, Booking, Listing, ListingImage, Review, User, WishlistItem
from app.schemas.dates import StayRequest
from app.schemas.listing import (
    HostOut,
    ImageOut,
    ListingDetail,
    ListingWrite,
    QuoteOut,
    RatingSummary,
)
from app.schemas.meta import AmenityOut
from app.services.availability import has_conflict
from app.services.pricing import calculate_quote
from app.services.reviews import rating_summary


def get_active_listing(db: Session, listing_id: int) -> Listing:
    listing = db.get(Listing, listing_id)
    if listing is None or not listing.is_active:
        raise NotFoundError("Listing not found")
    return listing


def get_owned_listing(db: Session, user: User, listing_id: int) -> Listing:
    """404 if it doesn't exist, 403 if it belongs to someone else."""
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise NotFoundError("Listing not found")
    if listing.host_id != user.id:
        raise ForbiddenError("You can only manage your own listings")
    return listing


def host_summary(db: Session, host: User) -> HostOut:
    listing_count = db.scalar(select(func.count()).select_from(Listing).where(Listing.host_id == host.id))
    avg, review_count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .join(Listing, Listing.id == Review.listing_id)
        .where(Listing.host_id == host.id)
    ).one()
    return HostOut(
        id=host.id,
        name=host.name,
        avatar_url=host.avatar_url,
        bio=host.bio,
        is_superhost=host.is_superhost,
        joined_at=host.joined_at,
        listing_count=listing_count or 0,
        review_count=review_count,
        average_rating=round(avg, 2) if avg is not None else None,
    )


def get_listing_detail(db: Session, listing_id: int, user: User | None) -> ListingDetail:
    listing = db.scalar(
        select(Listing)
        .where(Listing.id == listing_id)
        # Load images + amenities in one extra query each, and the host in the same row (many-to-one).
        .options(selectinload(Listing.images), selectinload(Listing.amenities), joinedload(Listing.host))
    )
    # Deactivated listings stay visible to their host only.
    if listing is None or (not listing.is_active and (user is None or user.id != listing.host_id)):
        raise NotFoundError("Listing not found")

    average, count = rating_summary(db, listing.id)
    is_wishlisted = user is not None and bool(
        db.scalar(
            select(exists().where(WishlistItem.user_id == user.id, WishlistItem.listing_id == listing.id))
        )
    )
    return ListingDetail(
        **{field: getattr(listing, field) for field in _PLAIN_DETAIL_FIELDS},
        images=[ImageOut.model_validate(img) for img in listing.images],
        amenities=[AmenityOut.model_validate(a) for a in sorted(listing.amenities, key=lambda a: a.id)],
        host=host_summary(db, listing.host),
        rating=RatingSummary(average=average, count=count),
        is_wishlisted=is_wishlisted,
    )


_PLAIN_DETAIL_FIELDS = [
    "id", "title", "description", "property_type", "category", "city", "state", "country", "address",
    "latitude", "longitude", "price_per_night", "cleaning_fee", "max_guests", "bedrooms", "beds",
    "bathrooms", "is_active", "created_at",
]


def get_quote(db: Session, listing_id: int, stay: StayRequest) -> QuoteOut:
    listing = get_active_listing(db, listing_id)
    if stay.guests > listing.max_guests:
        raise InvalidRequestError(f"This place allows at most {listing.max_guests} guests")
    quote = calculate_quote(listing.price_per_night, listing.cleaning_fee, stay.nights)
    return QuoteOut(
        check_in=stay.check_in,
        check_out=stay.check_out,
        guests=stay.guests,
        nights=quote.nights,
        nightly_price=quote.nightly_price,
        subtotal=quote.subtotal,
        cleaning_fee=quote.cleaning_fee,
        service_fee=quote.service_fee,
        total=quote.total,
        available=not has_conflict(db, listing.id, stay.check_in, stay.check_out),
    )


# ----------------------------------------------------------------------------- host CRUD


def _apply(db: Session, listing: Listing, data: ListingWrite) -> None:
    fields = data.model_dump(exclude={"image_urls", "amenity_ids"})
    for field, value in fields.items():
        setattr(listing, field, value)

    amenity_ids = set(data.amenity_ids)
    amenities = list(db.scalars(select(Amenity).where(Amenity.id.in_(amenity_ids)))) if amenity_ids else []
    if len(amenities) != len(amenity_ids):
        raise InvalidRequestError("One or more amenity ids don't exist")
    listing.amenities = amenities
    # Replacing the list deletes the old image rows (delete-orphan cascade on Listing.images).
    listing.images = [ListingImage(url=str(url), position=i) for i, url in enumerate(data.image_urls)]


def create_listing(db: Session, host: User, data: ListingWrite) -> Listing:
    listing = Listing(host=host)
    _apply(db, listing, data)
    db.add(listing)
    db.commit()
    return listing


def update_listing(db: Session, user: User, listing_id: int, data: ListingWrite) -> Listing:
    listing = get_owned_listing(db, user, listing_id)
    _apply(db, listing, data)
    db.commit()
    return listing


def delete_listing(db: Session, user: User, listing_id: int) -> None:
    """Soft delete: hide the listing but keep it, so past trips and reviews still make sense.

    Refused with 409 while there are upcoming confirmed stays — guests are counting on those.
    """
    listing = get_owned_listing(db, user, listing_id)
    has_upcoming = db.scalar(
        select(
            exists().where(
                Booking.listing_id == listing.id,
                Booking.status == BOOKING_CONFIRMED,
                Booking.check_out > date.today(),
            )
        )
    )
    if has_upcoming:
        raise ConflictError("This listing has upcoming reservations, so it can't be deleted yet")
    listing.is_active = False
    db.commit()
