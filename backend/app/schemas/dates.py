from datetime import date

from pydantic import BaseModel, Field, model_validator


class StayRequest(BaseModel):
    """Shared validation for anything that describes a stay (quote, booking).

    Violations become 422s automatically, before any service code runs.
    """

    check_in: date
    check_out: date
    guests: int = Field(1, ge=1)

    @model_validator(mode="after")
    def check_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        if self.check_in < date.today():
            raise ValueError("check_in can't be in the past")
        return self

    @property
    def nights(self) -> int:
        return (self.check_out - self.check_in).days
