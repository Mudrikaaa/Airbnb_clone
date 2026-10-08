from fastapi import APIRouter
from sqlalchemy import select

from app.catalog import CATEGORIES, PROPERTY_TYPES
from app.deps import DbSession
from app.models import Amenity
from app.schemas.meta import AmenityOut, CategoryOut, PropertyTypeOut

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/amenities", response_model=list[AmenityOut])
def amenities(db: DbSession):
    return db.scalars(select(Amenity).order_by(Amenity.id)).all()


@router.get("/categories", response_model=list[CategoryOut])
def categories():
    return CATEGORIES


@router.get("/property-types", response_model=list[PropertyTypeOut])
def property_types():
    return PROPERTY_TYPES
