from app.models import Listing
from tests.factories import auth, days, make_booking, make_listing


def listing_body(**overrides):
    body = {
        "title": "Brand new test cottage",
        "description": "A freshly listed cottage with a garden and a long description.",
        "property_type": "cottage",
        "category": "countryside",
        "city": "Coorg",
        "state": "Karnataka",
        "country": "India",
        "address": "12 Estate Road",
        "latitude": 12.42,
        "longitude": 75.73,
        "price_per_night": 5000,
        "cleaning_fee": 700,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2,
        "image_urls": ["https://img.test/a.jpg", "https://img.test/b.jpg"],
        "amenity_ids": [],
    }
    body.update(overrides)
    return body


def test_create_listing(client, host, amenities):
    res = client.post(
        "/api/listings", json=listing_body(amenity_ids=[a.id for a in amenities[:2]]), headers=auth(host)
    )
    assert res.status_code == 201
    body = res.json()
    assert body["host"]["id"] == host.id
    assert [img["url"] for img in body["images"]] == ["https://img.test/a.jpg", "https://img.test/b.jpg"]
    assert {a["name"] for a in body["amenities"]} == {"Wifi", "Pool"}
    assert body["rating"]["average"] is None and body["rating"]["count"] == 0
    assert set(body["rating"]["categories"].values()) == {None}
    # New listing shows up in search and the host's dashboard.
    assert client.get("/api/listings", params={"location": "coorg"}).json()["total"] == 1
    assert len(client.get("/api/host/listings", headers=auth(host)).json()) == 1


def test_create_listing_validation(client, host):
    assert client.post("/api/listings", json=listing_body(category="moon"), headers=auth(host)).status_code == 422
    assert client.post("/api/listings", json=listing_body(image_urls=[]), headers=auth(host)).status_code == 422
    assert client.post("/api/listings", json=listing_body(price_per_night=0), headers=auth(host)).status_code == 422
    res = client.post("/api/listings", json=listing_body(amenity_ids=[999]), headers=auth(host))
    assert res.status_code == 422
    assert res.json()["detail"] == "One or more amenity ids don't exist"


def test_create_listing_requires_login(client):
    assert client.post("/api/listings", json=listing_body()).status_code == 401


def test_update_replaces_fields_images_and_amenities(client, db, listing, host, amenities):
    res = client.put(
        f"/api/listings/{listing.id}",
        json=listing_body(title="Renamed test listing", image_urls=["https://img.test/new.jpg"], amenity_ids=[amenities[2].id]),
        headers=auth(host),
    )
    assert res.status_code == 200
    body = res.json()
    assert body["title"] == "Renamed test listing"
    assert [img["url"] for img in body["images"]] == ["https://img.test/new.jpg"]  # old 5 images deleted
    assert [a["name"] for a in body["amenities"]] == ["Kitchen"]


# ---------------------------------------------------------------- ownership (403)


def test_only_the_owner_can_update(client, listing, other_user):
    res = client.put(f"/api/listings/{listing.id}", json=listing_body(), headers=auth(other_user))
    assert res.status_code == 403
    assert res.json() == {"detail": "You can only manage your own listings"}


def test_only_the_owner_can_delete(client, listing, other_user):
    assert client.delete(f"/api/listings/{listing.id}", headers=auth(other_user)).status_code == 403


def test_missing_listing_is_404_not_403(client, other_user):
    assert client.put("/api/listings/999", json=listing_body(), headers=auth(other_user)).status_code == 404


# ---------------------------------------------------------------- delete policy


def test_delete_soft_deletes(client, db, listing, host):
    assert client.delete(f"/api/listings/{listing.id}", headers=auth(host)).status_code == 204
    db.expire_all()
    assert db.get(Listing, listing.id).is_active is False  # row kept for past trips / reviews
    assert client.get("/api/listings").json()["total"] == 0
    assert client.get(f"/api/listings/{listing.id}").status_code == 404
    assert client.get(f"/api/listings/{listing.id}", headers=auth(host)).status_code == 200  # host still sees it


def test_delete_with_upcoming_booking_is_409(client, db, listing, host, guest):
    make_booking(db, listing, guest, days(10), days(12))
    res = client.delete(f"/api/listings/{listing.id}", headers=auth(host))
    assert res.status_code == 409


def test_delete_allowed_when_only_past_or_cancelled_bookings(client, db, listing, host, guest):
    make_booking(db, listing, guest, days(-10), days(-8))
    make_booking(db, listing, guest, days(10), days(12), status="cancelled")
    assert client.delete(f"/api/listings/{listing.id}", headers=auth(host)).status_code == 204


def test_host_bookings_only_show_my_listings(client, db, listing, host, guest, other_user):
    someone_elses = make_listing(db, other_user, title="Not hosted by the host")
    make_booking(db, listing, guest, days(10), days(12))
    make_booking(db, someone_elses, guest, days(10), days(12))
    bookings = client.get("/api/host/bookings", headers=auth(host)).json()
    assert [b["listing"]["id"] for b in bookings] == [listing.id]
