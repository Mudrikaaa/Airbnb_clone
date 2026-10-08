from fastapi import APIRouter, status

from app.deps import CurrentUser, DbSession
from app.schemas.booking import BookingCreate, BookingOut, TripsOut
from app.services import bookings as booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create(body: BookingCreate, db: DbSession, user: CurrentUser):
    return booking_service.create_booking(db, user, body)


@router.get("/me", response_model=TripsOut)
def my_trips(db: DbSession, user: CurrentUser):
    return booking_service.get_trips(db, user)


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel(booking_id: int, db: DbSession, user: CurrentUser):
    return booking_service.cancel_booking(db, user, booking_id)
