"""Mock authentication: the frontend sends the logged-in user's id in an X-User-Id header.

A real app would verify a session cookie or JWT here; everything downstream only depends on
"give me the current User", so swapping the mechanism later wouldn't touch any router.
"""

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.db import get_db
from app.errors import NotAuthenticatedError
from app.models import User

DbSession = Annotated[Session, Depends(get_db)]


def get_optional_user(
    db: DbSession,
    x_user_id: Annotated[str | None, Header()] = None,
) -> User | None:
    """For public routes that personalise their response (e.g. is_wishlisted)."""
    if x_user_id is None or x_user_id == "":
        return None
    try:
        user = db.get(User, int(x_user_id))
    except ValueError:
        raise NotAuthenticatedError("X-User-Id must be a number") from None
    if user is None:
        raise NotAuthenticatedError("Unknown user")
    return user


def get_current_user(user: Annotated[User | None, Depends(get_optional_user)]) -> User:
    """For protected routes: 401 when nobody is logged in."""
    if user is None:
        raise NotAuthenticatedError("Log in to continue")
    return user


OptionalUser = Annotated[User | None, Depends(get_optional_user)]
CurrentUser = Annotated[User, Depends(get_current_user)]
