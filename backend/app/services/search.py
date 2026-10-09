"""Listing search and the shared "listing card" query used by search, wishlists and the host dashboard."""

from collections.abc import Sequence

from sqlalchemy import exists, func, or_, select
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.sql.elements import ColumnElement

from app.models import Booking, Listing, User, WishlistItem, listing_amenities
from app.schemas.listing import ListingCard, ListingPage, ListingSearchParams
from app.services.availability import blocking_booking_conditions
from app.services.reviews import rating_stats_subquery


def search_conditions(params: ListingSearchParams) -> list[ColumnElement[bool]]:
    conditions: list[ColumnElement[bool]] = [Listing.is_active.is_(True)]

    if params.location:
        # "Anjuna, Goa" -> every comma-separated term must match the city, state or country.
        for term in (t.strip().lower() for t in params.location.split(",")):
            if term:
                conditions.append(
                    or_(
                        *(
                            func.lower(column).contains(term, autoescape=True)
                            for column in (Listing.city, Listing.state, Listing.country)
                        )
                    )
                )

    if params.check_in and params.check_out:
        # NOT EXISTS (a confirmed booking on this listing that overlaps the requested stay).
        # The subquery references Listing.id, so SQLAlchemy correlates it to the outer row.
        conditions.append(
            ~exists().where(
                Booking.listing_id == Listing.id,
                *blocking_booking_conditions(params.check_in, params.check_out),
            )
        )

    if params.guests:
        conditions.append(Listing.max_guests >= params.guests)
    if params.min_price is not None:
        conditions.append(Listing.price_per_night >= params.min_price)
    if params.max_price is not None:
        conditions.append(Listing.price_per_night <= params.max_price)
    if types := params.property_types:
        conditions.append(Listing.property_type.in_(types))  # several allowed: villa OR cabin
    if params.bedrooms:
        conditions.append(Listing.bedrooms >= params.bedrooms)
    if params.beds:
        conditions.append(Listing.beds >= params.beds)
    if params.bathrooms:
        conditions.append(Listing.bathrooms >= params.bathrooms)
    if params.category:
        conditions.append(Listing.category == params.category)

    if amenity_ids := params.amenity_ids:
        # Must have ALL selected amenities: among the matching join rows, the listing needs one
        # per requested id. (A plain IN would mean "has ANY of them".)
        has_all = (
            select(listing_amenities.c.listing_id)
            .where(listing_amenities.c.amenity_id.in_(amenity_ids))
            .group_by(listing_amenities.c.listing_id)
            .having(func.count(listing_amenities.c.amenity_id) == len(amenity_ids))
        )
        conditions.append(Listing.id.in_(has_all))

    return conditions


def wishlisted_ids(db: Session, user: User | None, listing_ids: Sequence[int]) -> set[int]:
    if user is None or not listing_ids:
        return set()
    return set(
        db.scalars(
            select(WishlistItem.listing_id).where(
                WishlistItem.user_id == user.id, WishlistItem.listing_id.in_(listing_ids)
            )
        )
    )


def fetch_listing_cards(
    db: Session,
    conditions: Sequence[ColumnElement[bool]],
    user: User | None,
    *,
    offset: int | None = None,
    limit: int | None = None,
) -> list[ListingCard]:
    """Listing cards with rating stats and wishlist flag in a constant number of queries:

    1. listings + rating stats (outer join to an aggregated subquery — no per-row AVG queries)
    2. images for all those listings (selectinload: one `WHERE listing_id IN (...)` query)
    3. which of them the user has saved
    """
    stats = rating_stats_subquery()
    stmt = (
        select(Listing, stats.c.avg_rating, stats.c.review_count)
        .outerjoin(stats, stats.c.listing_id == Listing.id)
        .where(*conditions)
        .options(selectinload(Listing.images))
        .order_by(Listing.id)
        .offset(offset)
        .limit(limit)
    )
    rows = db.execute(stmt).all()
    saved = wishlisted_ids(db, user, [listing.id for listing, _, _ in rows])
    return [ListingCard.build(listing, avg, count, listing.id in saved) for listing, avg, count in rows]


def search_listings(db: Session, params: ListingSearchParams, user: User | None) -> ListingPage:
    conditions = search_conditions(params)
    total = db.scalar(select(func.count()).select_from(Listing).where(*conditions)) or 0
    items = fetch_listing_cards(
        db, conditions, user, offset=(params.page - 1) * params.page_size, limit=params.page_size
    )
    return ListingPage(items=items, total=total, page=params.page, page_size=params.page_size)
