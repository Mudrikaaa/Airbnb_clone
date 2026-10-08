"""Fixed vocabularies. Kept in code (not tables) because they change with releases, not with user data.

Keys are what's stored on listings; labels/icons are what the UI shows (Airbnb's wording).
Icons are lucide-react component names.
"""

CATEGORIES = [
    {"key": "beach", "label": "Beachfront", "icon": "Umbrella"},
    {"key": "pools", "label": "Amazing pools", "icon": "Waves"},
    {"key": "cabins", "label": "Cabins", "icon": "TreePine"},
    {"key": "mountains", "label": "Mountains", "icon": "MountainSnow"},
    {"key": "countryside", "label": "Countryside", "icon": "Tractor"},
    {"key": "city", "label": "Iconic cities", "icon": "Building2"},
    {"key": "lakefront", "label": "Lakefront", "icon": "Sailboat"},
    {"key": "tropical", "label": "Tropical", "icon": "TreePalm"},
    {"key": "heritage", "label": "Historical homes", "icon": "Castle"},
    {"key": "desert", "label": "Desert", "icon": "Sun"},
]

PROPERTY_TYPES = [
    {"key": "house", "label": "House"},
    {"key": "apartment", "label": "Apartment"},
    {"key": "villa", "label": "Villa"},
    {"key": "cabin", "label": "Cabin"},
    {"key": "cottage", "label": "Cottage"},
    {"key": "loft", "label": "Loft"},
    {"key": "farmhouse", "label": "Farmhouse"},
    {"key": "guesthouse", "label": "Guesthouse"},
]

CATEGORY_KEYS = {c["key"] for c in CATEGORIES}
PROPERTY_TYPE_KEYS = {p["key"] for p in PROPERTY_TYPES}
