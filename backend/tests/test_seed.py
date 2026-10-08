"""Seed invariants. The `db` fixture (fresh in-memory SQLite) lives in conftest.py."""

from datetime import date

from sqlalchemy import select

from app.models import BOOKING_CONFIRMED, Booking, Listing, ListingImage, Review, User
from app.seed.seed import seed, seed_if_empty, table_counts
from app.services.availability import ranges_overlap
from app.services.pricing import calculate_quote


def test_seed_counts(db):
    seed(db)
    counts = table_counts(db)
    assert counts["users"] == 10
    assert counts["listings"] >= 48
    assert counts["listing_images"] == counts["listings"] * 5
    assert counts["bookings"] >= 25


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


def test_review_distribution_and_ratings(db):
    seed(db)
    listings = db.scalars(select(Listing)).all()
    review_counts = [len(listing.reviews) for listing in listings]
    assert sum(c >= 3 for c in review_counts) >= 40
    assert 6 <= sum(c == 0 for c in review_counts) <= 10  # shown as "New"
    for listing in listings:
        if listing.reviews:
            avg = sum(r.rating for r in listing.reviews) / len(listing.reviews)
            assert 4.2 <= avg <= 5.0, (listing.title, avg)


def test_a_few_three_star_reviews_on_different_listings(db):
    seed(db)
    threes = db.scalars(select(Review).where(Review.rating == 3)).all()
    assert len(threes) == 6
    assert len({r.listing_id for r in threes}) == 6
    assert db.scalars(select(Review).where(Review.rating < 3)).all() == []


def test_every_review_belongs_to_its_own_stay(db):
    seed(db)
    reviews = db.scalars(select(Review)).all()
    assert len({r.booking_id for r in reviews}) == len(reviews)  # one review per stay
    assert len({r.comment for r in reviews}) == len(reviews)  # no copy-pasted comments
    assert all(r.listing_id == r.booking.listing_id for r in reviews)


def test_booking_prices_match_pricing_service(db):
    seed(db)
    for b in db.scalars(select(Booking)).all():
        quote = calculate_quote(b.listing.price_per_night, b.listing.cleaning_fee, b.nights)
        assert (b.nightly_price, b.cleaning_fee, b.service_fee, b.total_price) == (
            quote.nightly_price, quote.cleaning_fee, quote.service_fee, quote.total
        )
        assert (b.check_out - b.check_in).days == b.nights
        assert b.guest_id != b.listing.host_id
        assert 1 <= b.guests <= b.listing.max_guests


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
