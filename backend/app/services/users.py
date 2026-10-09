from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.models import Listing, User
from app.schemas.user import UserMe, UserOut


def list_users(db: Session) -> list[UserOut]:
    users = db.scalars(select(User).order_by(User.id)).all()
    # A host is someone with at least one active listing (soft-deleted ones don't count).
    host_ids = set(db.scalars(select(Listing.host_id).where(Listing.is_active).distinct()))  # one query, not one per user
    return [
        UserOut(id=u.id, name=u.name, avatar_url=u.avatar_url, is_superhost=u.is_superhost, is_host=u.id in host_ids)
        for u in users
    ]


def get_me(db: Session, user: User) -> UserMe:
    is_host = bool(db.scalar(select(exists().where(Listing.host_id == user.id, Listing.is_active))))
    return UserMe(
        id=user.id,
        name=user.name,
        avatar_url=user.avatar_url,
        is_superhost=user.is_superhost,
        is_host=is_host,
        email=user.email,
        bio=user.bio,
        joined_at=user.joined_at,
    )
