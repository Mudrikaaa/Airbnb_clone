"""Creating, listing and cancelling bookings."""

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.errors import ConflictError, ForbiddenError, InvalidRequestError, NotFoundError
from app.models import BOOKING_CANCELLED, BOOKING_CONFIRMED, Booking, Listing, User
from app.schemas.booking import BookingCreate, BookingOut, TripsOut
from app.services.availability import has_conflict
from app.services.listings import get_active_listing
from app.services.pricing import calculate_quote

DATES_TAKEN = "Those dates are no longer available"

# Everything BookingOut needs, loaded in batched queries instead of one query per booking.
BOOKING_OUT_OPTIONS = (
    selectinload(Booking.listing).selectinload(Listing.images),
    selectinload(Booking.listing).selectinload(Listing.host),
    selectinload(Booking.guest),
    selectinload(Booking.review),
)


def get_booking_out(db: Session, booking_id: int) -> BookingOut:
    booking = db.scalar(select(Booking).where(Booking.id == booking_id).options(*BOOKING_OUT_OPTIONS))
    return BookingOut.build(booking)


def create_booking(db: Session, guest: User, data: BookingCreate) -> BookingOut:
    # Date order and "not in the past" were already checked by the BookingCreate schema (422).
    listing = get_active_listing(db, data.listing_id)
    if listing.host_id == guest.id:
        raise ForbiddenError("You can't book your own listing")
    if data.guests > listing.max_guests:
        raise InvalidRequestError(f"This place allows at most {listing.max_guests} guests")
    if has_conflict(db, listing.id, data.check_in, data.check_out):
        raise ConflictError(DATES_TAKEN)

    # The price is recomputed here, never taken from the client, and stored as a snapshot.
    quote = calculate_quote(listing.price_per_night, listing.cleaning_fee, data.nights)
    booking = Booking(
        listing_id=listing.id,
        guest_id=guest.id,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        nightly_price=quote.nightly_price,
        nights=quote.nights,
        cleaning_fee=quote.cleaning_fee,
        service_fee=quote.service_fee,
        total_price=quote.total,
        status=BOOKING_CONFIRMED,
    )
    db.add(booking)
    db.flush()  # INSERT now: SQLite takes its write lock here, so only one writer gets past this line at a time.

    # Re-check after inserting. If two requests for the same dates both passed the first check,
    # the second one to get the write lock sees the first booking here and backs out.
    if has_conflict(db, listing.id, data.check_in, data.check_out, exclude_booking_id=booking.id):
        db.rollback()
        raise ConflictError(DATES_TAKEN)

    db.commit()
    return get_booking_out(db, booking.id)


def get_trips(db: Session, guest: User) -> TripsOut:
    bookings = db.scalars(
        select(Booking)
        .where(Booking.guest_id == guest.id)
        .options(*BOOKING_OUT_OPTIONS)
        .order_by(Booking.check_in)
    ).all()
    today = date.today()
    trips = TripsOut(upcoming=[], past=[], cancelled=[])
    for booking in bookings:
        out = BookingOut.build(booking)
        if booking.status == BOOKING_CANCELLED:
            trips.cancelled.append(out)
        elif booking.check_out > today:
            trips.upcoming.append(out)
        else:
            trips.past.append(out)
    trips.past.reverse()  # most recent first
    return trips


def get_host_bookings(db: Session, host: User) -> list[BookingOut]:
    bookings = db.scalars(
        select(Booking)
        .join(Listing, Listing.id == Booking.listing_id)
        .where(Listing.host_id == host.id)
        .options(*BOOKING_OUT_OPTIONS)
        .order_by(Booking.check_in)
    ).all()
    return [BookingOut.build(b) for b in bookings]


def cancel_booking(db: Session, user: User, booking_id: int) -> BookingOut:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.guest_id != user.id:
        raise ForbiddenError("You can only cancel your own bookings")
    if booking.status == BOOKING_CANCELLED:
        raise ConflictError("This booking is already cancelled")
    if booking.check_in <= date.today():
        raise ConflictError("This stay has already started, so it can't be cancelled")
    booking.status = BOOKING_CANCELLED
    db.commit()
    return get_booking_out(db, booking.id)
