from fastapi import APIRouter

from app.deps import CurrentUser, DbSession
from app.schemas.user import UserMe, UserOut
from app.services import users as user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(db: DbSession):
    """Public on purpose: it powers the mock "Log in as…" menu."""
    return user_service.list_users(db)


@router.get("/me", response_model=UserMe)
def me(db: DbSession, user: CurrentUser):
    return user_service.get_me(db, user)
