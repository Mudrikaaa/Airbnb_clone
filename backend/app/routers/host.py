from fastapi import APIRouter

from app.deps import CurrentUser, DbSession
from app.models import Listing
from app.schemas.booking import BookingOut
from app.schemas.listing import ListingCard
from app.services.bookings import get_host_bookings
from app.services.search import fetch_listing_cards

router = APIRouter(prefix="/host", tags=["host"])


@router.get("/listings", response_model=list[ListingCard])
def my_listings(db: DbSession, user: CurrentUser):
    # Includes deactivated listings (is_active=false) so the host can still see them.
    return fetch_listing_cards(db, [Listing.host_id == user.id], user)


@router.get("/bookings", response_model=list[BookingOut])
def bookings_on_my_listings(db: DbSession, user: CurrentUser):
    return get_host_bookings(db, user)
