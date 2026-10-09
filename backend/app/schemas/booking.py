from datetime import date, datetime

from pydantic import BaseModel

from app.models import Booking
from app.schemas.dates import StayRequest
from app.schemas.user import UserSummary


class BookingCreate(StayRequest):
    """Only what the guest chooses. Prices are never accepted from the client — the server computes them."""

    listing_id: int


class BookingListing(BaseModel):
    id: int
    title: str
    city: str
    country: str
    cover_image: str | None
    host: UserSummary  # shown on trip cards ("Hosted by …")


class BookingOut(BaseModel):
    id: int
    listing: BookingListing
    guest: UserSummary
    check_in: date
    check_out: date
    guests: int
    nights: int
    nightly_price: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    # What the host receives: the stay and cleaning fee, without the service fee the guest pays Airbnb.
    host_payout: int
    status: str
    created_at: datetime
    has_review: bool

    @classmethod
    def build(cls, booking: Booking):
        listing = booking.listing
        return cls(
            id=booking.id,
            listing=BookingListing(
                id=listing.id,
                title=listing.title,
                city=listing.city,
                country=listing.country,
                cover_image=listing.images[0].url if listing.images else None,
                host=UserSummary.model_validate(listing.host),
            ),
            guest=UserSummary.model_validate(booking.guest),
            check_in=booking.check_in,
            check_out=booking.check_out,
            guests=booking.guests,
            nights=booking.nights,
            nightly_price=booking.nightly_price,
            cleaning_fee=booking.cleaning_fee,
            service_fee=booking.service_fee,
            total_price=booking.total_price,
            host_payout=booking.total_price - booking.service_fee,
            status=booking.status,
            created_at=booking.created_at,
            has_review=booking.review is not None,
        )


class TripsOut(BaseModel):
    upcoming: list[BookingOut]  # includes a stay in progress
    past: list[BookingOut]
    cancelled: list[BookingOut]
