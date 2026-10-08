from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Listing, User, WishlistItem
from app.schemas.listing import ListingCard
from app.services.listings import get_active_listing
from app.services.search import fetch_listing_cards


def get_wishlist(db: Session, user: User) -> list[ListingCard]:
    saved_ids = list(
        db.scalars(
            select(WishlistItem.listing_id)
            .where(WishlistItem.user_id == user.id)
            .order_by(WishlistItem.created_at.desc())
        )
    )
    cards = fetch_listing_cards(db, [Listing.id.in_(saved_ids), Listing.is_active.is_(True)], user)
    position = {listing_id: i for i, listing_id in enumerate(saved_ids)}
    return sorted(cards, key=lambda card: position[card.id])  # most recently saved first


def add_to_wishlist(db: Session, user: User, listing_id: int) -> None:
    """Idempotent: saving an already-saved listing is a no-op (the composite PK prevents duplicates)."""
    get_active_listing(db, listing_id)
    if db.get(WishlistItem, (user.id, listing_id)) is None:
        db.add(WishlistItem(user_id=user.id, listing_id=listing_id))
        db.commit()


def remove_from_wishlist(db: Session, user: User, listing_id: int) -> None:
    """Idempotent: removing something that isn't saved is a no-op."""
    item = db.get(WishlistItem, (user.id, listing_id))
    if item is not None:
        db.delete(item)
        db.commit()
