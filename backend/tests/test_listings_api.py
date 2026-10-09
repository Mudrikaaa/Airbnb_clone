"""Search, detail, availability, quote, reviews, wishlists and auth."""

from sqlalchemy import event

from app.models import Review, WishlistItem
from tests.factories import auth, days, make_booking, make_listing


# ---------------------------------------------------------------- search filters


def test_search_returns_page_shape(client, db, host):
    for i in range(3):
        make_listing(db, host, title=f"Listing number {i}")
    body = client.get("/api/listings", params={"page_size": 2, "page": 2}).json()
    assert body["total"] == 3
    assert body["page"] == 2 and body["page_size"] == 2
    assert len(body["items"]) == 1
    card = body["items"][0]
    assert len(card["images"]) == 5 and card["rating"] is None and card["review_count"] == 0


def test_date_filter_excludes_overlapping_but_not_back_to_back(client, db, host, guest):
    booked = make_listing(db, host, title="Booked listing")
    free = make_listing(db, host, title="Free listing")
    make_booking(db, booked, guest, days(10), days(15))
    cancelled = make_listing(db, host, title="Cancelled listing")
    make_booking(db, cancelled, guest, days(10), days(15), status="cancelled")

    def titles(check_in, check_out):
        items = client.get("/api/listings", params={"check_in": str(check_in), "check_out": str(check_out)}).json()["items"]
        return {i["title"] for i in items}

    assert titles(days(12), days(14)) == {"Free listing", "Cancelled listing"}
    assert titles(days(15), days(17)) == {"Booked listing", "Free listing", "Cancelled listing"}  # back-to-back


def test_amenities_filter_requires_all(client, db, host, amenities):
    wifi, pool, kitchen = amenities
    both = make_listing(db, host, title="Wifi and pool")
    both.amenities = [wifi, pool]
    only_wifi = make_listing(db, host, title="Only wifi")
    only_wifi.amenities = [wifi]
    db.commit()
    items = client.get("/api/listings", params={"amenities": f"{wifi.id},{pool.id}"}).json()["items"]
    assert [i["title"] for i in items] == ["Wifi and pool"]
    assert client.get("/api/listings", params={"amenities": "x,1"}).status_code == 422


def test_other_filters(client, db, host):
    make_listing(db, host, title="Cheap Goa beach hut", price_per_night=2000, max_guests=2, category="beach", property_type="cottage")
    make_listing(db, host, title="Pricey Paris loft", city="Paris", state="Île-de-France", country="France",
                 price_per_night=20000, max_guests=6, category="city", property_type="loft")

    def titles(**params):
        return [i["title"] for i in client.get("/api/listings", params=params).json()["items"]]

    assert titles(location="paris") == ["Pricey Paris loft"]
    assert titles(location="Anjuna, Goa") == ["Cheap Goa beach hut"]
    assert titles(location="france, goa") == []  # every term must match
    assert titles(guests=4) == ["Pricey Paris loft"]
    assert titles(min_price=1000, max_price=5000) == ["Cheap Goa beach hut"]
    assert titles(category="city") == ["Pricey Paris loft"]
    assert titles(property_type="cottage") == ["Cheap Goa beach hut"]
    assert client.get("/api/listings", params={"min_price": 10, "max_price": 1}).status_code == 422
    assert client.get("/api/listings", params={"check_in": str(days(1))}).status_code == 422


def test_search_includes_rating_and_wishlist_flag(client, db, listing, guest, other_user):
    for i, (rating, author) in enumerate([(5, guest), (4, other_user)]):
        stay = make_booking(db, listing, author, days(-20 + i * 5), days(-18 + i * 5))
        db.add(Review(listing=listing, author=author, booking=stay, rating=rating, comment="Nice"))
    db.add(WishlistItem(user_id=guest.id, listing_id=listing.id))
    db.commit()
    card = client.get("/api/listings", headers=auth(guest)).json()["items"][0]
    assert card["rating"] == 4.5 and card["review_count"] == 2 and card["is_wishlisted"] is True
    assert client.get("/api/listings").json()["items"][0]["is_wishlisted"] is False  # logged out


def test_search_query_count_does_not_grow_with_results(client, db, host, guest):
    """Guards against N+1: images, ratings and wishlist flags must be batched, not loaded per card."""
    statements = []
    engine = db.get_bind()

    def count(*_args):
        statements.append(1)

    def queries_for_search() -> int:
        statements.clear()
        event.listen(engine, "before_cursor_execute", count)
        client.get("/api/listings", headers=auth(guest))
        event.remove(engine, "before_cursor_execute", count)
        return len(statements)

    make_listing(db, host)
    with_one = queries_for_search()
    for i in range(10):
        make_listing(db, host, title=f"Extra listing {i}")
    assert queries_for_search() == with_one


# ---------------------------------------------------------------- detail, availability, quote


def test_detail(client, db, listing, amenities):
    listing.amenities = amenities
    db.commit()
    body = client.get(f"/api/listings/{listing.id}").json()
    assert body["host"]["name"] == "Hana Host" and body["host"]["listing_count"] == 1
    assert len(body["images"]) == 5 and len(body["amenities"]) == 3
    assert client.get("/api/listings/999").status_code == 404


def test_availability_lists_future_confirmed_stays_only(client, db, listing, guest):
    make_booking(db, listing, guest, days(-10), days(-5))
    make_booking(db, listing, guest, days(5), days(8))
    make_booking(db, listing, guest, days(20), days(22), status="cancelled")
    booked = client.get(f"/api/listings/{listing.id}/availability").json()["booked"]
    assert booked == [{"check_in": str(days(5)), "check_out": str(days(8))}]


def test_quote(client, db, listing, guest):
    params = {"check_in": str(days(10)), "check_out": str(days(13)), "guests": 2}
    body = client.get(f"/api/listings/{listing.id}/quote", params=params).json()
    assert body["subtotal"] == 12000 and body["cleaning_fee"] == 500
    assert body["service_fee"] == 1680 and body["total"] == 14180
    assert body["available"] is True
    make_booking(db, listing, guest, days(11), days(12))
    assert client.get(f"/api/listings/{listing.id}/quote", params=params).json()["available"] is False
    too_many = {**params, "guests": 10}
    assert client.get(f"/api/listings/{listing.id}/quote", params=too_many).status_code == 422


# ---------------------------------------------------------------- reviews


def test_review_rules(client, db, listing, guest, other_user):
    past = make_booking(db, listing, guest, days(-10), days(-7))
    future = make_booking(db, listing, guest, days(10), days(12))
    url = f"/api/listings/{listing.id}/reviews"
    body = {"booking_id": past.id, "rating": 5, "comment": "Loved it"}

    assert client.post(url, json=body, headers=auth(other_user)).status_code == 403  # not their stay
    assert client.post(url, json={**body, "booking_id": future.id}, headers=auth(guest)).status_code == 403  # not over
    assert client.post(url, json={**body, "rating": 6}, headers=auth(guest)).status_code == 422
    assert client.post(url, json=body, headers=auth(guest)).status_code == 201
    assert client.post(url, json=body, headers=auth(guest)).status_code == 409  # one review per stay

    reviews = client.get(url).json()
    assert len(reviews) == 1 and reviews[0]["author"]["name"] == "Gita Guest"


def test_category_ratings_are_stored_and_averaged(client, db, listing, guest, other_user):
    first = make_booking(db, listing, guest, days(-20), days(-18))
    second = make_booking(db, listing, other_user, days(-10), days(-7))
    url = f"/api/listings/{listing.id}/reviews"
    cats = {"cleanliness": 5, "accuracy": 4, "check_in": 5, "communication": 5, "location": 3, "value": 4}
    assert client.post(url, json={"booking_id": first.id, "rating": 5, "comment": "Great", **cats}, headers=auth(guest)).status_code == 201
    # The second review skips the categories: AVG ignores NULLs, so it doesn't lower them.
    assert client.post(url, json={"booking_id": second.id, "rating": 3, "comment": "Okay"}, headers=auth(other_user)).status_code == 201
    assert client.post(url, json={"booking_id": second.id, "rating": 3, "comment": "x", "value": 0}, headers=auth(other_user)).status_code == 422

    rating = client.get(f"/api/listings/{listing.id}").json()["rating"]
    assert rating["average"] == 4.0 and rating["count"] == 2
    assert rating["categories"] == {k: float(v) for k, v in cats.items()}
    by_rating = {r["rating"]: r for r in client.get(url).json()}
    assert by_rating[5]["location"] == 3 and by_rating[3]["location"] is None


def test_detail_rating_is_one_query(client, db, listing, guest):
    # Overall + six categories come from one aggregate SELECT (the host card has its own rating query).
    from sqlalchemy import event

    statements = []
    listener = lambda *args: statements.append(args[2])  # noqa: E731
    event.listen(db.get_bind(), "before_cursor_execute", listener)
    try:
        client.get(f"/api/listings/{listing.id}")
    finally:
        event.remove(db.get_bind(), "before_cursor_execute", listener)
    category_queries = [s.lower() for s in statements if "avg(reviews.cleanliness)" in s.lower()]
    assert len(category_queries) == 1 and "avg(reviews.rating)" in category_queries[0]
    assert "avg(reviews.value)" in category_queries[0]


# ---------------------------------------------------------------- wishlists


def test_wishlist_put_and_delete_are_idempotent(client, listing, guest):
    url = f"/api/wishlists/{listing.id}"
    assert client.put(url, headers=auth(guest)).status_code == 204
    assert client.put(url, headers=auth(guest)).status_code == 204
    assert [c["id"] for c in client.get("/api/wishlists", headers=auth(guest)).json()] == [listing.id]
    assert client.delete(url, headers=auth(guest)).status_code == 204
    assert client.delete(url, headers=auth(guest)).status_code == 204
    assert client.get("/api/wishlists", headers=auth(guest)).json() == []
    assert client.put("/api/wishlists/999", headers=auth(guest)).status_code == 404
    assert client.get("/api/wishlists").status_code == 401


# ---------------------------------------------------------------- users / auth


def test_users_and_me(client, listing, host, guest):
    users = {u["name"]: u for u in client.get("/api/users").json()}
    assert users["Hana Host"]["is_host"] is True and users["Gita Guest"]["is_host"] is False
    me = client.get("/api/users/me", headers=auth(guest)).json()
    assert me["email"] == "guest@test.com"
    assert client.get("/api/users/me").status_code == 401
    assert client.get("/api/users/me", headers={"X-User-Id": "nope"}).status_code == 401
    assert client.get("/api/users/me", headers={"X-User-Id": "999"}).status_code == 401


def test_soft_deleted_listings_do_not_make_a_host(client, db, listing, host):
    # Only active listings count: a user whose listings are all deleted gets "Become a host" again.
    listing.is_active = False
    db.commit()
    users = {u["name"]: u for u in client.get("/api/users").json()}
    assert users["Hana Host"]["is_host"] is False
    assert client.get("/api/users/me", headers=auth(host)).json()["is_host"] is False


def test_rooms_and_multiple_property_types(client, db, host):
    make_listing(db, host, title="Small cottage", property_type="cottage", bedrooms=1, beds=1, bathrooms=1)
    make_listing(db, host, title="Big villa", property_type="villa", bedrooms=4, beds=6, bathrooms=3)
    make_listing(db, host, title="Mid cabin", property_type="cabin", bedrooms=2, beds=3, bathrooms=1)

    def titles(**params):
        return sorted(i["title"] for i in client.get("/api/listings", params=params).json()["items"])

    assert titles(bedrooms=2) == ["Big villa", "Mid cabin"]  # "at least"
    assert titles(beds=4) == ["Big villa"]
    assert titles(bathrooms=2) == ["Big villa"]
    assert titles(property_type="villa,cabin") == ["Big villa", "Mid cabin"]  # any of them
    assert titles(property_type="cottage,villa", bedrooms=2) == ["Big villa"]  # combined with other filters
    assert client.get("/api/listings", params={"bedrooms": 0}).status_code == 422
