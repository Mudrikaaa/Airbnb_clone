from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, status

from app.deps import CurrentUser, DbSession, OptionalUser
from app.schemas.dates import StayRequest
from app.schemas.listing import (
    AvailabilityOut,
    BookedRange,
    ListingDetail,
    ListingPage,
    ListingSearchParams,
    ListingWrite,
    QuoteOut,
)
from app.schemas.review import ReviewCreate, ReviewOut
from app.services import listings as listing_service
from app.services import reviews as review_service
from app.services.availability import booked_ranges
from app.services.search import search_listings

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=ListingPage)
def search(params: Annotated[ListingSearchParams, Query()], db: DbSession, user: OptionalUser):
    return search_listings(db, params, user)


@router.get("/{listing_id}", response_model=ListingDetail)
def detail(listing_id: int, db: DbSession, user: OptionalUser):
    return listing_service.get_listing_detail(db, listing_id, user)


@router.get("/{listing_id}/availability", response_model=AvailabilityOut)
def availability(listing_id: int, db: DbSession):
    listing_service.get_active_listing(db, listing_id)
    ranges = booked_ranges(db, listing_id, from_date=date.today())
    return AvailabilityOut(booked=[BookedRange(check_in=ci, check_out=co) for ci, co in ranges])


@router.get("/{listing_id}/quote", response_model=QuoteOut)
def quote(listing_id: int, stay: Annotated[StayRequest, Query()], db: DbSession):
    return listing_service.get_quote(db, listing_id, stay)


@router.get("/{listing_id}/reviews", response_model=list[ReviewOut])
def reviews(listing_id: int, db: DbSession):
    return review_service.list_reviews(db, listing_id)


@router.post("/{listing_id}/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def add_review(listing_id: int, body: ReviewCreate, db: DbSession, user: CurrentUser):
    return review_service.create_review(db, user, listing_id, body)


# --- host CRUD (ownership is checked in the service: 403 for someone else's listing)


@router.post("", response_model=ListingDetail, status_code=status.HTTP_201_CREATED)
def create(body: ListingWrite, db: DbSession, user: CurrentUser):
    listing = listing_service.create_listing(db, user, body)
    return listing_service.get_listing_detail(db, listing.id, user)


@router.put("/{listing_id}", response_model=ListingDetail)
def update(listing_id: int, body: ListingWrite, db: DbSession, user: CurrentUser):
    listing_service.update_listing(db, user, listing_id, body)
    return listing_service.get_listing_detail(db, listing_id, user)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(listing_id: int, db: DbSession, user: CurrentUser):
    listing_service.delete_listing(db, user, listing_id)
