from fastapi import APIRouter, status

from app.deps import CurrentUser, DbSession
from app.schemas.listing import ListingCard
from app.services import wishlists as wishlist_service

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


@router.get("", response_model=list[ListingCard])
def my_wishlist(db: DbSession, user: CurrentUser):
    return wishlist_service.get_wishlist(db, user)


# PUT/DELETE on the item itself (not POST) because both are idempotent: repeating them changes nothing.
@router.put("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def save(listing_id: int, db: DbSession, user: CurrentUser):
    wishlist_service.add_to_wishlist(db, user, listing_id)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave(listing_id: int, db: DbSession, user: CurrentUser):
    wishlist_service.remove_from_wishlist(db, user, listing_id)
