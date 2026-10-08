"""Idempotent seed.

    python -m app.seed.seed          # seed only if the DB is empty
    python -m app.seed.seed --reset  # drop all tables, recreate, reseed

Bookings are generated relative to *today*, so a fresh deploy always has upcoming and past trips.
A fixed random seed keeps the data identical between runs.
"""

import argparse
import json
import random
from datetime import date, datetime, timedelta
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models  # noqa: F401  (registers all tables)
from app.db import Base, SessionLocal, engine
from app.models import (
    BOOKING_CANCELLED,
    BOOKING_CONFIRMED,
    Amenity,
    Booking,
    Listing,
    ListingImage,
    Review,
    User,
    WishlistItem,
)
from app.seed.data.amenities import AMENITIES
from app.seed.data.listings import LISTINGS
from app.seed.data.reviews import REVIEWS
from app.seed.data.users import AVATAR, USERS
from app.services.availability import ranges_overlap
from app.services.pricing import calculate_quote

PHOTOS_FILE = Path(__file__).parent / "data" / "photos.json"
PHOTO_URL = "https://images.unsplash.com/{}?auto=format&fit=crop&w=1200&q=80"

TARGET_BOOKINGS = 25
PAST_BOOKINGS = 16  # the rest are upcoming
CANCELLED_UPCOMING = 2

WISHLISTS = {  # user key -> listing titles
    "rohan": ["Pine-wood cabin in Old Manali", "Rice-terrace villa with infinity pool",
              "Matterhorn-view chalet in Zermatt"],
    "meera": ["Backwater villa with private jetty", "Haussmann apartment in Le Marais"],
    "daniel": ["Cave house with caldera plunge pool", "Ladakhi mud-brick home with Stok views"],
}


def load_photo_pools() -> dict[str, list[str]]:
    data = json.loads(PHOTOS_FILE.read_text(encoding="utf-8"))
    return {k: v for k, v in data.items() if not k.startswith("_")}


def all_image_urls() -> list[str]:
    """Every image URL the seed can use (pools incl. spares + avatars). Used by scripts/check_images.py."""
    urls = [PHOTO_URL.format(p) for pool in load_photo_pools().values() for p in pool]
    urls += [AVATAR.format(u["avatar"]) for u in USERS]
    return urls


# --------------------------------------------------------------------------- steps


def seed_users(db: Session) -> dict[str, User]:
    users = {}
    for u in USERS:
        user = User(
            name=u["name"],
            email=u["email"],
            avatar_url=AVATAR.format(u["avatar"]),
            bio=u["bio"],
            is_superhost=u["is_superhost"],
            joined_at=datetime.fromisoformat(u["joined"]),
        )
        db.add(user)
        users[u["key"]] = user
    return users


def seed_amenities(db: Session) -> dict[str, Amenity]:
    amenities = {name: Amenity(name=name, icon=icon) for name, icon in AMENITIES}
    db.add_all(amenities.values())
    return amenities


def seed_listings(db: Session, users: dict[str, User], amenities: dict[str, Amenity]) -> list[Listing]:
    pools = load_photo_pools()
    listings = []
    for i, d in enumerate(LISTINGS):
        # Cover = an exterior matching the category, then the rooms in the order Airbnb shows them.
        # pop(0) guarantees no photo is used twice.
        kitchen_pool = "dining" if i % 3 == 2 else "kitchen"
        photo_paths = [pools[d["category"]].pop(0)] + [
            pools[p].pop(0) for p in ("living", "bedroom", kitchen_pool, "bathroom")
        ]
        listing = Listing(
            host=users[d["host"]],
            title=d["title"],
            description=d["description"],
            property_type=d["property_type"],
            category=d["category"],
            city=d["city"],
            state=d["state"],
            country=d["country"],
            address=d["address"],
            latitude=d["lat"],
            longitude=d["lng"],
            price_per_night=d["price"],
            cleaning_fee=d["cleaning"],
            max_guests=d["guests"],
            bedrooms=d["bedrooms"],
            beds=d["beds"],
            bathrooms=d["baths"],
            images=[ListingImage(url=PHOTO_URL.format(p), position=pos) for pos, p in enumerate(photo_paths)],
            amenities=[amenities[name] for name in dict.fromkeys(d["amenities"])],  # de-dupe, keep order
        )
        db.add(listing)
        listings.append(listing)
    return listings


def seed_bookings(db: Session, users: dict[str, User], listings: list[Listing], rng: random.Random) -> list[Booking]:
    today = date.today()
    guests = [users[k] for k in ("rohan", "meera", "daniel", "arjun")]
    everyone = list(users.values())
    bookings: list[Booking] = []

    while len(bookings) < TARGET_BOOKINGS:
        n = len(bookings)
        listing = rng.choice(listings)
        # Mostly our 4 guests (so each has trips to show); every 5th stay is a host travelling.
        guest = guests[n % len(guests)] if n % 5 else rng.choice(everyone)
        if guest is listing.host:
            continue  # hosts can't book their own place

        is_past = n < PAST_BOOKINGS
        check_in = today + timedelta(days=rng.randint(-150, -10) if is_past else rng.randint(3, 75))
        nights = rng.randint(2, 6)
        check_out = check_in + timedelta(days=nights)

        if any(
            b.listing is listing and ranges_overlap(b.check_in, b.check_out, check_in, check_out)
            for b in bookings
        ):
            continue  # pick another slot — seed data must respect the same no-overlap rule as the API

        quote = calculate_quote(listing.price_per_night, listing.cleaning_fee, nights)
        is_cancelled = n >= TARGET_BOOKINGS - CANCELLED_UPCOMING
        booking = Booking(
            listing=listing,
            guest=guest,
            check_in=check_in,
            check_out=check_out,
            guests=rng.randint(1, listing.max_guests),
            nightly_price=quote.nightly_price,
            nights=quote.nights,
            cleaning_fee=quote.cleaning_fee,
            service_fee=quote.service_fee,
            total_price=quote.total,
            status=BOOKING_CANCELLED if is_cancelled else BOOKING_CONFIRMED,
            created_at=datetime.combine(check_in - timedelta(days=rng.randint(7, 40)), datetime.min.time()),
        )
        db.add(booking)
        bookings.append(booking)
    return bookings


def seed_reviews(db: Session, bookings: list[Booking]) -> None:
    today = date.today()
    past_stays = [b for b in bookings if b.status == BOOKING_CONFIRMED and b.check_out <= today]
    for booking, (rating, comment) in zip(past_stays, REVIEWS):
        db.add(
            Review(
                listing=booking.listing,
                author=booking.guest,
                booking=booking,
                rating=rating,
                comment=comment,
                created_at=datetime.combine(booking.check_out + timedelta(days=2), datetime.min.time()),
            )
        )


def seed_wishlists(db: Session, users: dict[str, User], listings: list[Listing]) -> None:
    by_title = {listing.title: listing for listing in listings}
    for user_key, titles in WISHLISTS.items():
        for title in titles:
            db.add(WishlistItem(user=users[user_key], listing=by_title[title]))


# --------------------------------------------------------------------------- entry points


def seed(db: Session) -> None:
    rng = random.Random(42)
    users = seed_users(db)
    amenities = seed_amenities(db)
    listings = seed_listings(db, users, amenities)
    bookings = seed_bookings(db, users, listings, rng)
    seed_reviews(db, bookings)
    seed_wishlists(db, users, listings)
    db.commit()


def seed_if_empty(db: Session) -> bool:
    """Seed only a brand-new database. Returns True if it seeded."""
    if db.scalar(select(func.count()).select_from(User)):
        return False
    seed(db)
    return True


def table_counts(db: Session) -> dict[str, int]:
    return {
        table.name: db.scalar(select(func.count()).select_from(table))
        for table in Base.metadata.sorted_tables
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Airbnb clone database.")
    parser.add_argument("--reset", action="store_true", help="drop all tables and reseed from scratch")
    args = parser.parse_args()

    if args.reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        seeded = seed_if_empty(db)
        print("Seeded database." if seeded else "Database already has data; nothing to do (use --reset).")
        for name, count in table_counts(db).items():
            print(f"  {name:<18} {count:>4}")


if __name__ == "__main__":
    main()
