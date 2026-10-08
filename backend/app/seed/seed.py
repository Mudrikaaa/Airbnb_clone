"""Idempotent seed.

    python -m app.seed.seed          # seed only if the DB is empty
    python -m app.seed.seed --reset  # drop all tables, recreate, reseed

Bookings are generated relative to *today*, so a fresh deploy always has upcoming and past trips.
A fixed random seed keeps the data identical between runs.

Two kinds of bookings are seeded:
- "trips": 25 bookings, mostly by the 4 guest accounts, so /trips has upcoming + past stays to show.
- "review history": older past stays whose only purpose is to give listings real, consistent reviews.
Both go through `add_booking`, so they obey the same overlap and pricing rules as the API.
"""

import argparse
import json
import math
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
from app.seed.data.reviews import FIVE_STAR_BY_CATEGORY, FIVE_STAR_GENERAL, FOUR_STAR
from app.seed.data.users import AVATAR, USERS
from app.services.availability import ranges_overlap
from app.services.pricing import calculate_quote

PHOTOS_FILE = Path(__file__).parent / "data" / "photos.json"
PHOTO_URL = "https://images.unsplash.com/{}?auto=format&fit=crop&w=1200&q=80"

TARGET_TRIPS = 25
PAST_TRIPS = 16  # the rest are upcoming
CANCELLED_UPCOMING = 2

# Listings that show "New" on their card: no past stays, so no reviews. Future trips are still allowed.
NEW_LISTINGS = {
    "Hillside hut above Om Beach",
    "Indiranagar loft for remote work",
    "Desert farmhouse with camel trails",
    "Cabin in the deodars above McLeod Ganj",
    "Atlantic beach house in Comporta",
    "Bamboo jungle house in Canggu",
    "Nilgiri hill cottage with fireplace",
    "Artist's attic in Montmartre",
}
REVIEW_COUNT_CHOICES = [3, 3, 3, 4, 4, 5]  # reviews per established listing
MIN_AVG_RATING, MAX_AVG_RATING = 4.2, 5.0

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


def at_midnight(d: date) -> datetime:
    return datetime.combine(d, datetime.min.time())


def add_booking(
    db: Session,
    bookings: list[Booking],
    listing: Listing,
    guest: User,
    check_in: date,
    nights: int,
    rng: random.Random,
    status: str = BOOKING_CONFIRMED,
) -> Booking | None:
    """Create a booking with the same rules as the API, or return None if the slot isn't valid."""
    check_out = check_in + timedelta(days=nights)
    if guest is listing.host:
        return None  # hosts can't book their own place
    if any(
        b.listing is listing and ranges_overlap(b.check_in, b.check_out, check_in, check_out)
        for b in bookings
    ):
        return None  # the caller picks another slot

    quote = calculate_quote(listing.price_per_night, listing.cleaning_fee, nights)
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
        status=status,
        created_at=at_midnight(check_in - timedelta(days=rng.randint(7, 60))),
    )
    db.add(booking)
    bookings.append(booking)
    return booking


def seed_trips(
    db: Session, bookings: list[Booking], users: dict[str, User], listings: list[Listing], rng: random.Random
) -> None:
    today = date.today()
    guests = [users[k] for k in ("rohan", "meera", "daniel", "arjun")]
    everyone = list(users.values())
    trips: list[Booking] = []

    while len(trips) < TARGET_TRIPS:
        n = len(trips)
        listing = rng.choice(listings)
        is_past = n < PAST_TRIPS
        if is_past and listing.title in NEW_LISTINGS:
            continue  # "New" listings have never been stayed in
        # Mostly our 4 guests (so each has trips to show); every 5th stay is a host travelling.
        guest = guests[n % len(guests)] if n % 5 else rng.choice(everyone)
        check_in = today + timedelta(days=rng.randint(-150, -10) if is_past else rng.randint(3, 75))
        status = BOOKING_CANCELLED if n >= TARGET_TRIPS - CANCELLED_UPCOMING else BOOKING_CONFIRMED
        trip = add_booking(db, bookings, listing, guest, check_in, rng.randint(2, 6), rng, status)
        if trip:
            trips.append(trip)


def plan_ratings(count: int, rng: random.Random) -> list[int]:
    """Ratings (4s and 5s) whose average lands in [MIN_AVG_RATING, MAX_AVG_RATING].

    Start from a random target average, round the total *up* so we never fall below the target,
    then turn that many 5s into 4s. Since the target is >= 4.2, we never need a 3.
    """
    target = rng.uniform(MIN_AVG_RATING, MAX_AVG_RATING)
    fours = 5 * count - min(5 * count, math.ceil(target * count))
    ratings = [4] * fours + [5] * (count - fours)
    rng.shuffle(ratings)
    return ratings


class CommentPicker:
    """Hands out each hand-written comment at most once, matched to the rating and listing category."""

    def __init__(self, rng: random.Random):
        def shuffled(items: list[str]) -> list[str]:
            items = list(items)
            rng.shuffle(items)
            return items

        self.five_by_category = {k: shuffled(v) for k, v in FIVE_STAR_BY_CATEGORY.items()}
        self.five_general = shuffled(FIVE_STAR_GENERAL)
        self.four = shuffled(FOUR_STAR)

    def pick(self, rating: int, category: str) -> str:
        if rating == 5:
            pool = self.five_by_category.get(category) or self.five_general
        else:
            pool = self.four
        if not pool:
            raise RuntimeError("Ran out of unique review comments; add more to app/seed/data/reviews.py")
        return pool.pop()


def seed_review_history(
    db: Session, bookings: list[Booking], users: dict[str, User], listings: list[Listing], rng: random.Random
) -> None:
    """Give every established listing 3-5 past stays, each reviewed by the guest who stayed."""
    today = date.today()
    everyone = list(users.values())
    comments = CommentPicker(rng)

    for listing in listings:
        if listing.title in NEW_LISTINGS:
            continue
        stays = [
            b for b in bookings
            if b.listing is listing and b.status == BOOKING_CONFIRMED and b.check_out <= today
        ]
        target = max(rng.choice(REVIEW_COUNT_CHOICES), len(stays))
        while len(stays) < target:
            # A different guest for each extra stay — the same person reviewing a place five times looks fake.
            previous_guests = {s.guest for s in stays}
            guest = rng.choice([u for u in everyone if u is not listing.host and u not in previous_guests])
            check_in = today - timedelta(days=rng.randint(30, 720))  # check-out is still at least 23 days ago
            stay = add_booking(db, bookings, listing, guest, check_in, rng.randint(2, 7), rng)
            if stay:
                stays.append(stay)

        stays.sort(key=lambda s: s.check_in)
        for stay, rating in zip(stays, plan_ratings(len(stays), rng)):
            db.add(
                Review(
                    listing=listing,
                    author=stay.guest,
                    booking=stay,
                    rating=rating,
                    comment=comments.pick(rating, listing.category),
                    created_at=at_midnight(stay.check_out + timedelta(days=rng.randint(1, 6))),
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
    bookings: list[Booking] = []  # every booking so far, so each new one can be overlap-checked
    seed_trips(db, bookings, users, listings, rng)
    seed_review_history(db, bookings, users, listings, rng)
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
