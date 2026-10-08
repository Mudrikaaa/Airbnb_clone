"""Single source of truth for prices. The frontend never computes money itself."""

from dataclasses import dataclass

SERVICE_FEE_PERCENT = 14


@dataclass(frozen=True)
class PriceQuote:
    nightly_price: int
    nights: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total: int


def round_half_up_percent(amount: int, percent: int) -> int:
    # Integer maths avoids float error and Python's round() banker's rounding (round(2.5) == 2).
    return (amount * percent + 50) // 100


def calculate_quote(price_per_night: int, cleaning_fee: int, nights: int) -> PriceQuote:
    if nights < 1:
        raise ValueError("nights must be at least 1")
    subtotal = price_per_night * nights
    service_fee = round_half_up_percent(subtotal, SERVICE_FEE_PERCENT)
    return PriceQuote(
        nightly_price=price_per_night,
        nights=nights,
        subtotal=subtotal,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total=subtotal + cleaning_fee + service_fee,
    )
