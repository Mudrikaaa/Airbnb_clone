from datetime import date

import pytest
from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.db import Base
from app.models import BOOKING_CONFIRMED, Booking, Listing, ListingImage, Review, User
from app.seed.seed import seed, seed_if_empty, table_counts
from app.services.availability import ranges_overlap


@pytest.fixture
def db():
    # Fresh in-memory DB per test; StaticPool keeps the single connection alive.
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    event.listen(engine, "connect", lambda conn, _: conn.execute("PRAGMA foreign_keys=ON"))
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


def test_seed_counts(db):
    seed(db)
    counts = table_counts(db)
    assert counts["users"] == 10
    assert counts["listings"] >= 48
    assert counts["listing_images"] == counts["listings"] * 5
    assert counts["bookings"] == 25


def test_seed_is_idempotent(db):
    assert seed_if_empty(db) is True
    before = table_counts(db)
    assert seed_if_empty(db) is False
    assert table_counts(db) == before


def test_seeded_bookings_never_overlap(db):
    seed(db)
    confirmed = db.scalars(select(Booking).where(Booking.status == BOOKING_CONFIRMED)).all()
    for a in confirmed:
        for b in confirmed:
            if a.id < b.id and a.listing_id == b.listing_id:
                assert not ranges_overlap(a.check_in, a.check_out, b.check_in, b.check_out)


def test_reviews_only_on_past_stays_by_the_guest(db):
    seed(db)
    for review in db.scalars(select(Review)).all():
        assert review.booking.check_out <= date.today()
        assert review.booking.status == BOOKING_CONFIRMED
        assert review.author_id == review.booking.guest_id


def test_two_superhosts_among_six_hosts(db):
    seed(db)
    hosts = db.scalars(select(User).where(User.listings.any())).all()
    assert len(hosts) == 6
    assert sum(h.is_superhost for h in hosts) == 2


def test_deleting_listing_cascades_images(db):
    seed(db)
    listing = db.scalars(select(Listing).where(~Listing.bookings.any(), ~Listing.reviews.any())).first()
    listing_id = listing.id
    db.delete(listing)
    db.commit()
    assert db.scalars(select(ListingImage).where(ListingImage.listing_id == listing_id)).all() == []
