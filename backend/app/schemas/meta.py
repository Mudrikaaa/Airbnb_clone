from pydantic import BaseModel, ConfigDict


class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: str


class CategoryOut(BaseModel):
    key: str
    label: str
    icon: str


class PropertyTypeOut(BaseModel):
    key: str
    label: str
