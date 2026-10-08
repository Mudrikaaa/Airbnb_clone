import pytest

from app.models import Booking
from app.services.pricing import calculate_quote
from tests.factories import auth, days, make_booking, make_listing


def book(client, user, listing, check_in, check_out, guests=2):
    return client.post(
        "/api/bookings",
        json={"listing_id": listing.id, "check_in": str(check_in), "check_out": str(check_out), "guests": guests},
        headers=auth(user),
    )


# ---------------------------------------------------------------- 201 + price snapshot


def test_create_booking_returns_201_with_server_computed_price(client, db, listing, guest):
    res = book(client, guest, listing, days(10), days(13))
    assert res.status_code == 201
    body = res.json()
    expected = calculate_quote(listing.price_per_night, listing.cleaning_fee, 3)
    assert body["nights"] == 3
    assert body["service_fee"] == expected.service_fee
    assert body["total_price"] == expected.total
    assert body["status"] == "confirmed"
    assert body["guest"]["id"] == guest.id
    assert body["listing"]["cover_image"] == "https://img.test/0.jpg"


def test_price_snapshot_survives_a_later_price_change(client, db, listing, guest):
    booking_id = book(client, guest, listing, days(10), days(12)).json()["id"]
    listing.price_per_night = 99_999
    db.commit()
    stored = db.get(Booking, booking_id)
    assert stored.nightly_price == 4000


def test_client_cannot_set_the_price(client, listing, guest):
    res = client.post(
        "/api/bookings",
        json={"listing_id": listing.id, "check_in": str(days(5)), "check_out": str(days(6)), "guests": 1, "total_price": 1},
        headers=auth(guest),
    )
    assert res.status_code == 201
    assert res.json()["total_price"] != 1  # unknown fields are ignored; price is always recomputed


# ---------------------------------------------------------------- overlap edge cases (409)


@pytest.mark.parametrize(
    ("new_in", "new_out", "expected"),
    [
        (8, 10, 201),  # back-to-back: new check-in on the existing check-out day
        (1, 3, 201),   # back-to-back: new check-out on the existing check-in day
        (9, 12, 201),  # clearly after
        (7, 10, 409),  # overlaps the end (shares the night of day 7)
        (2, 4, 409),   # overlaps the start
        (4, 6, 409),   # entirely inside
        (2, 9, 409),   # wraps around the existing stay
        (3, 8, 409),   # identical dates
    ],
)
def test_overlap_rules(client, db, listing, guest, other_user, new_in, new_out, expected):
    make_booking(db, listing, other_user, days(3), days(8))  # existing stay: nights of days 3-7
    assert book(client, guest, listing, days(new_in), days(new_out)).status_code == expected


def test_overlap_returns_409_with_detail(client, db, listing, guest, other_user):
    make_booking(db, listing, other_user, days(3), days(8))
    res = book(client, guest, listing, days(5), days(9))
    assert res.status_code == 409
    assert res.json() == {"detail": "Those dates are no longer available"}


def test_cancelled_bookings_do_not_block_dates(client, db, listing, guest, other_user):
    make_booking(db, listing, other_user, days(3), days(8), status="cancelled")
    assert book(client, guest, listing, days(3), days(8)).status_code == 201


def test_bookings_on_other_listings_do_not_block(client, db, host, listing, guest, other_user):
    other_listing = make_listing(db, host, title="Another test listing")
    make_booking(db, other_listing, other_user, days(3), days(8))
    assert book(client, guest, listing, days(3), days(8)).status_code == 201


# ---------------------------------------------------------------- validation (422) and other rules


@pytest.mark.parametrize(
    ("check_in", "check_out", "message"),
    [
        (5, 5, "check_out must be after check_in"),
        (6, 5, "check_out must be after check_in"),
        (-1, 2, "check_in can't be in the past"),
    ],
)
def test_invalid_dates_are_422(client, listing, guest, check_in, check_out, message):
    res = book(client, guest, listing, days(check_in), days(check_out))
    assert res.status_code == 422
    assert message in res.json()["detail"]


def test_too_many_guests_is_422(client, listing, guest):
    res = book(client, guest, listing, days(5), days(7), guests=listing.max_guests + 1)
    assert res.status_code == 422
    assert res.json()["detail"] == "This place allows at most 4 guests"


def test_zero_guests_is_422(client, listing, guest):
    assert book(client, guest, listing, days(5), days(7), guests=0).status_code == 422


def test_missing_field_is_422_with_string_detail(client, guest):
    res = client.post("/api/bookings", json={"check_in": str(days(5))}, headers=auth(guest))
    assert res.status_code == 422
    assert isinstance(res.json()["detail"], str)


def test_booking_requires_login(client, listing):
    res = client.post(
        "/api/bookings", json={"listing_id": listing.id, "check_in": str(days(5)), "check_out": str(days(7))}
    )
    assert res.status_code == 401


def test_host_cannot_book_own_listing(client, listing, host):
    assert book(client, host, listing, days(5), days(7)).status_code == 403


def test_unknown_or_inactive_listing_is_404(client, db, listing, guest):
    res = client.post(
        "/api/bookings",
        json={"listing_id": 999, "check_in": str(days(5)), "check_out": str(days(7))},
        headers=auth(guest),
    )
    assert res.status_code == 404
    listing.is_active = False
    db.commit()
    assert book(client, guest, listing, days(5), days(7)).status_code == 404


# ---------------------------------------------------------------- trips + cancel


def test_trips_are_split_into_upcoming_past_cancelled(client, db, listing, guest):
    make_booking(db, listing, guest, days(-10), days(-7))
    make_booking(db, listing, guest, days(-1), days(2))  # in progress -> upcoming
    make_booking(db, listing, guest, days(20), days(22))
    make_booking(db, listing, guest, days(30), days(32), status="cancelled")
    trips = client.get("/api/bookings/me", headers=auth(guest)).json()
    assert [len(trips[k]) for k in ("upcoming", "past", "cancelled")] == [2, 1, 1]


def test_cancel_frees_the_dates(client, db, listing, guest, other_user):
    booking_id = book(client, guest, listing, days(10), days(12)).json()["id"]
    res = client.post(f"/api/bookings/{booking_id}/cancel", headers=auth(guest))
    assert res.status_code == 200
    assert res.json()["status"] == "cancelled"
    assert book(client, other_user, listing, days(10), days(12)).status_code == 201


def test_cancel_rules(client, db, listing, guest, other_user):
    booking = make_booking(db, listing, guest, days(10), days(12))
    assert client.post(f"/api/bookings/{booking.id}/cancel", headers=auth(other_user)).status_code == 403
    assert client.post(f"/api/bookings/{booking.id}/cancel", headers=auth(guest)).status_code == 200
    assert client.post(f"/api/bookings/{booking.id}/cancel", headers=auth(guest)).status_code == 409
    started = make_booking(db, listing, guest, days(-1), days(1))
    assert client.post(f"/api/bookings/{started.id}/cancel", headers=auth(guest)).status_code == 409
    assert client.post("/api/bookings/999/cancel", headers=auth(guest)).status_code == 404
