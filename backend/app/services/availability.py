"""Booking overlap rules."""

from datetime import date


def ranges_overlap(a_in: date, a_out: date, b_in: date, b_out: date) -> bool:
    """Half-open ranges [check_in, check_out): the check-out day is free for the next guest's check-in."""
    return a_in < b_out and a_out > b_in
