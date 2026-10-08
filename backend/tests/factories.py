"""Plain helpers for building test data (imported by tests; fixtures live in conftest.py)."""

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import Booking, Listing, ListingImage, User
from app.services.pricing import calculate_quote


def auth(user: User) -> dict[str, str]:
    return {"X-User-Id": str(user.id)}


def days(n: int) -> date:
    return date.today() + timedelta(days=n)


def make_listing(db: Session, host: User, **overrides) -> Listing:
    fields = dict(
        title="Test villa by the sea",
        description="A lovely test listing with plenty of description text.",
        property_type="villa",
        category="beach",
        city="Anjuna",
        state="Goa",
        country="India",
        address="1 Test Road",
        latitude=15.57,
        longitude=73.74,
        price_per_night=4000,
        cleaning_fee=500,
        max_guests=4,
        bedrooms=2,
        beds=2,
        bathrooms=1,
    )
    fields.update(overrides)
    listing = Listing(host=host, images=[ListingImage(url=f"https://img.test/{i}.jpg", position=i) for i in range(5)], **fields)
    db.add(listing)
    db.commit()
    return listing


def make_booking(db: Session, listing: Listing, guest: User, check_in: date, check_out: date, status: str = "confirmed") -> Booking:
    nights = (check_out - check_in).days
    q = calculate_quote(listing.price_per_night, listing.cleaning_fee, nights)
    booking = Booking(
        listing=listing, guest=guest, check_in=check_in, check_out=check_out, guests=1,
        nightly_price=q.nightly_price, nights=nights, cleaning_fee=q.cleaning_fee,
        service_fee=q.service_fee, total_price=q.total, status=status,
    )
    db.add(booking)
    db.commit()
    return booking
