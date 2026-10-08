from datetime import date

import pytest

from app.services.availability import ranges_overlap
from app.services.pricing import calculate_quote


def d(day: int) -> date:
    return date(2030, 1, day)


@pytest.mark.parametrize(
    ("existing", "new", "overlaps"),
    [
        ((1, 5), (5, 8), False),  # back-to-back: check-out day is someone else's check-in day
        ((5, 8), (1, 5), False),  # same, the other way round
        ((1, 5), (4, 6), True),   # partial overlap at the end
        ((4, 6), (1, 5), True),   # partial overlap at the start
        ((1, 10), (3, 4), True),  # new stay inside existing
        ((3, 4), (1, 10), True),  # new stay wraps existing
        ((1, 5), (1, 5), True),   # identical
        ((1, 3), (6, 9), False),  # clearly apart
    ],
)
def test_ranges_overlap(existing, new, overlaps):
    assert ranges_overlap(d(existing[0]), d(existing[1]), d(new[0]), d(new[1])) is overlaps


def test_quote_breakdown():
    q = calculate_quote(price_per_night=4200, cleaning_fee=800, nights=3)
    assert q.subtotal == 12600
    assert q.service_fee == 1764  # 14% of 12,600
    assert q.total == 12600 + 800 + 1764


def test_service_fee_rounds_half_up():
    # 14% of 25 = 3.5 -> 4, and 14% of 75 = 10.5 -> 11 (Python's round(10.5) would give 10).
    assert calculate_quote(price_per_night=25, cleaning_fee=0, nights=1).service_fee == 4
    assert calculate_quote(price_per_night=75, cleaning_fee=0, nights=1).service_fee == 11


def test_zero_nights_rejected():
    with pytest.raises(ValueError):
        calculate_quote(price_per_night=1000, cleaning_fee=0, nights=0)
