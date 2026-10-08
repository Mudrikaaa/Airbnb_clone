"""Booking overlap rules — the one place that defines when two stays clash.

Stays are half-open ranges [check_in, check_out): the check-out day is free for the next
guest's check-in. Two stays overlap when existing.check_in < new.check_out AND
existing.check_out > new.check_in. Only *confirmed* bookings block dates; cancelled ones don't.
"""

from datetime import date

from sqlalchemy import exists, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.models import BOOKING_CONFIRMED, Booking


def ranges_overlap(a_in: date, a_out: date, b_in: date, b_out: date) -> bool:
    """Pure-Python version of the rule (used by the seed and unit tests)."""
    return a_in < b_out and a_out > b_in


def blocking_booking_conditions(check_in: date, check_out: date) -> list[ColumnElement[bool]]:
    """SQL version of the same rule: confirmed bookings that overlap [check_in, check_out)."""
    return [
        Booking.status == BOOKING_CONFIRMED,
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    ]


def has_conflict(
    db: Session,
    listing_id: int,
    check_in: date,
    check_out: date,
    exclude_booking_id: int | None = None,
) -> bool:
    conditions = [Booking.listing_id == listing_id, *blocking_booking_conditions(check_in, check_out)]
    if exclude_booking_id is not None:
        conditions.append(Booking.id != exclude_booking_id)
    return bool(db.scalar(select(exists().where(*conditions))))


def booked_ranges(db: Session, listing_id: int, from_date: date) -> list[tuple[date, date]]:
    """Confirmed stays that haven't ended yet, for greying out calendar days."""
    rows = db.execute(
        select(Booking.check_in, Booking.check_out)
        .where(
            Booking.listing_id == listing_id,
            Booking.status == BOOKING_CONFIRMED,
            Booking.check_out > from_date,
        )
        .order_by(Booking.check_in)
    ).all()
    return [(row.check_in, row.check_out) for row in rows]
