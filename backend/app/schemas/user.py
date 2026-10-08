from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserSummary(BaseModel):
    """Small user shape embedded in other responses (review author, booking guest)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    avatar_url: str | None


class UserOut(UserSummary):
    """Used by the mock "Log in as…" switcher."""

    is_superhost: bool
    is_host: bool


class UserMe(UserOut):
    email: str
    bio: str | None
    joined_at: datetime
