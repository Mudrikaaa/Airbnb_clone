from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator

from app.catalog import CATEGORY_KEYS, PROPERTY_TYPE_KEYS
from app.models import Listing
from app.schemas.meta import AmenityOut

# ----------------------------------------------------------------------------- search


class ListingSearchParams(BaseModel):
    """Query string for GET /listings. Declared as a model so FastAPI validates it as one unit."""

    location: str | None = None
    check_in: date | None = None
    check_out: date | None = None
    guests: int | None = Field(None, ge=1)
    min_price: int | None = Field(None, ge=0)
    max_price: int | None = Field(None, ge=0)
    property_type: str | None = Field(None, description="Comma-separated; listing may be ANY of them")
    category: str | None = None
    bedrooms: int | None = Field(None, ge=1, le=50, description="At least this many bedrooms")
    beds: int | None = Field(None, ge=1, le=50, description="At least this many beds")
    bathrooms: int | None = Field(None, ge=1, le=50, description="At least this many bathrooms")
    amenities: str | None = Field(None, description="Comma-separated amenity ids; listing must have ALL")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=50)

    @model_validator(mode="after")
    def check_ranges(self):
        if (self.check_in is None) != (self.check_out is None):
            raise ValueError("check_in and check_out must be given together")
        if self.check_in and self.check_out and self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        if self.min_price is not None and self.max_price is not None and self.min_price > self.max_price:
            raise ValueError("min_price can't be greater than max_price")
        _ = self.amenity_ids  # fail fast (422) on malformed ids
        return self

    @property
    def property_types(self) -> list[str]:
        return [t.strip() for t in (self.property_type or "").split(",") if t.strip()]

    @property
    def amenity_ids(self) -> list[int]:
        if not self.amenities:
            return []
        try:
            return sorted({int(part) for part in self.amenities.split(",") if part.strip()})
        except ValueError:
            raise ValueError("amenities must be a comma-separated list of ids") from None


class ListingCard(BaseModel):
    """What a listing card in a grid needs — nothing more, so pages stay small."""

    id: int
    title: str
    city: str
    state: str | None
    country: str
    property_type: str
    category: str
    price_per_night: int
    bedrooms: int
    beds: int
    latitude: float
    longitude: float
    images: list[str]
    rating: float | None
    review_count: int
    is_wishlisted: bool
    is_active: bool

    @classmethod
    def build(cls, listing: Listing, avg_rating: float | None, review_count: int | None, is_wishlisted: bool):
        return cls(
            id=listing.id,
            title=listing.title,
            city=listing.city,
            state=listing.state,
            country=listing.country,
            property_type=listing.property_type,
            category=listing.category,
            price_per_night=listing.price_per_night,
            bedrooms=listing.bedrooms,
            beds=listing.beds,
            latitude=listing.latitude,
            longitude=listing.longitude,
            images=[img.url for img in listing.images],
            rating=round(avg_rating, 2) if avg_rating is not None else None,
            review_count=review_count or 0,
            is_wishlisted=is_wishlisted,
            is_active=listing.is_active,
        )


class ListingPage(BaseModel):
    items: list[ListingCard]
    total: int
    page: int
    page_size: int


# ----------------------------------------------------------------------------- detail


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


class RatingSummary(BaseModel):
    average: float | None
    count: int


class HostOut(BaseModel):
    """Everything the "Meet your host" section shows."""

    id: int
    name: str
    avatar_url: str | None
    bio: str | None
    is_superhost: bool
    joined_at: datetime
    listing_count: int
    review_count: int
    average_rating: float | None


class ListingDetail(BaseModel):
    id: int
    title: str
    description: str
    property_type: str
    category: str
    city: str
    state: str | None
    country: str
    address: str
    latitude: float
    longitude: float
    price_per_night: int
    cleaning_fee: int
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    is_active: bool
    created_at: datetime
    images: list[ImageOut]
    amenities: list[AmenityOut]
    host: HostOut
    rating: RatingSummary
    is_wishlisted: bool


class BookedRange(BaseModel):
    check_in: date
    check_out: date


class AvailabilityOut(BaseModel):
    """Booked [check_in, check_out) ranges; the check_out day itself is free."""

    booked: list[BookedRange]


class QuoteOut(BaseModel):
    check_in: date
    check_out: date
    guests: int
    nights: int
    nightly_price: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total: int
    available: bool


# ----------------------------------------------------------------------------- host create / update


class ListingWrite(BaseModel):
    """Body for POST /listings and PUT /listings/{id} (PUT replaces the whole listing)."""

    title: str = Field(min_length=5, max_length=120)
    description: str = Field(min_length=20, max_length=5000)
    property_type: str
    category: str
    city: str = Field(min_length=1, max_length=100)
    state: str | None = Field(None, max_length=100)
    country: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=3, max_length=300)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    price_per_night: int = Field(gt=0, le=1_000_000)
    cleaning_fee: int = Field(0, ge=0, le=100_000)
    max_guests: int = Field(ge=1, le=16)
    bedrooms: int = Field(ge=0, le=50)
    beds: int = Field(ge=1, le=50)
    bathrooms: int = Field(ge=0, le=50)
    image_urls: list[HttpUrl] = Field(min_length=1, max_length=20)
    amenity_ids: list[int] = Field(default_factory=list)

    @field_validator("property_type")
    @classmethod
    def known_property_type(cls, value: str) -> str:
        if value not in PROPERTY_TYPE_KEYS:
            raise ValueError(f"property_type must be one of: {', '.join(sorted(PROPERTY_TYPE_KEYS))}")
        return value

    @field_validator("category")
    @classmethod
    def known_category(cls, value: str) -> str:
        if value not in CATEGORY_KEYS:
            raise ValueError(f"category must be one of: {', '.join(sorted(CATEGORY_KEYS))}")
        return value
