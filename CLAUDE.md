# CLAUDE.md — Airbnb Clone (SDE Fullstack Assignment)

Read this file fully before doing anything. It is the source of truth for this project.

## Goal
A functional Airbnb web clone that **looks and feels like airbnb.com** (UI similarity is graded), with working browse/search, listing detail, booking (no overlapping dates), host CRUD, wishlist and toasts. Payments, messaging, identity verification and auth can be mocked. Hard deadline: ~20 hours of build time. **Must-haves first, bonus only after everything core works and is deployed.**

The developer must be able to explain every line in an interview. So:
- Prefer simple, explicit code over clever abstractions.
- No unnecessary libraries. Every dependency must have a one-line reason.
- Small files, clear names, short comments on *why* (not what).
- After each phase, summarise the key design decisions in 5 bullets.

## Grading criteria (optimise for these)
Functionality · UI/UX similarity to Airbnb · Database design · Backend/API design · Code quality · Modularity · Code understanding.

## Tech stack (fixed)
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
  - `react-day-picker` + `date-fns` (2-month range calendar), `lucide-react` (icons), `sonner` (toasts), `swr` (data fetching), `react-leaflet` + OpenStreetMap tiles (map, bonus)
  - Use plain `<img>` (or `next/image` with `unoptimized`) because host photos come from arbitrary URLs.
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy 2.0 (typed `Mapped[]` models), Pydantic v2, Uvicorn, pytest
- **DB:** SQLite. Tables created via `Base.metadata.create_all` + an idempotent seed script (no Alembic — note this in README assumptions).
- **Deploy:** Frontend → Vercel (root `frontend/`). Backend → Railway with a volume mounted at `/data` (`DATABASE_URL=sqlite:////data/airbnb.db`) so bookings survive restarts. Fallback: Render (document that free-tier disk is ephemeral).

## Repo layout
```
/
├── CLAUDE.md
├── README.md
├── backend/
│   ├── app/
│   │   ├── main.py            # app factory, CORS, router registration, startup seed
│   │   ├── config.py          # settings from env (DATABASE_URL, FRONTEND_ORIGIN)
│   │   ├── db.py              # engine, SessionLocal, Base, get_db
│   │   ├── deps.py            # get_current_user (mock auth via X-User-Id header)
│   │   ├── models/            # one file per aggregate: user, listing, booking, review, wishlist
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── routers/           # listings, bookings, host, wishlists, reviews, users, meta
│   │   ├── services/          # availability.py, pricing.py, search.py  (business logic lives here, not in routers)
│   │   └── seed/              # seed.py + data files
│   ├── tests/                 # pytest: overlap logic, pricing, booking API
│   └── requirements.txt
└── frontend/
    ├── app/                   # routes (see below)
    ├── components/            # layout/, search/, listing/, booking/, host/, ui/
    ├── lib/                   # api.ts (typed client), types.ts, format.ts, auth-context.tsx
    └── tailwind.config.ts     # Airbnb design tokens
```

## Database schema (design intent — keep relationships explicit)
- **users**: id, name, email (unique), avatar_url, bio, is_superhost (bool), joined_at
  - Any user can be a guest; a user is a "host" if they own listings. UI has a guest ⇄ host mode switch ("Switch to hosting").
- **listings**: id, host_id → users, title, description, property_type (house/apartment/villa/cabin/…), category (beach/mountains/countryside/city/pools/…), city, state, country, address, latitude, longitude, price_per_night (int, INR), cleaning_fee (int), max_guests, bedrooms, beds, bathrooms, is_active, created_at, updated_at
- **listing_images**: id, listing_id → listings (cascade delete), url, position
- **amenities**: id, name (unique), icon (lucide icon name)
- **listing_amenities**: listing_id, amenity_id (composite PK, M2M)
- **bookings**: id, listing_id → listings, guest_id → users, check_in (date), check_out (date), guests, nightly_price, nights, cleaning_fee, service_fee, total_price (**price snapshot at booking time**), status (confirmed/cancelled), created_at
  - Index on (listing_id, check_in, check_out)
  - CHECK check_out > check_in
- **reviews**: id, listing_id, author_id, booking_id (nullable, unique — one review per stay), rating (1–5), comment, created_at
- **wishlist_items**: user_id, listing_id (composite PK), created_at
- Listing rating + review count are **aggregated in queries**, not stored (be ready to explain trade-off).

## Core business rules
- **Overlap rule:** a new booking conflicts if an existing *confirmed* booking on that listing has `existing.check_in < new.check_out AND existing.check_out > new.check_in`. Check-out day is bookable as someone else's check-in day. Return **409** on conflict.
- Validation: check_in ≥ today, check_out > check_in, 1 ≤ guests ≤ max_guests, host cannot book own listing.
- **Pricing (single source of truth in `services/pricing.py`):** subtotal = price_per_night × nights; service_fee = round(14% of subtotal); total = subtotal + cleaning_fee + service_fee. Frontend never computes prices itself — it calls the quote endpoint.
- Host endpoints verify ownership → 403 otherwise.
- Deleting a listing with future confirmed bookings → 409 (or soft-delete via is_active; pick one and document it).

## API (REST, prefix `/api`)
- `GET /users` (for the mock login switcher), `GET /users/me`
- `GET /meta/amenities`, `GET /meta/categories`, `GET /meta/property-types`
- `GET /listings` — query: location, check_in, check_out, guests, min_price, max_price, property_type, category, amenities (comma list, must have ALL), page, page_size. Returns `{items, total, page, page_size}`. Date filter excludes listings with overlapping bookings.
- `GET /listings/{id}` — full detail incl. images, amenities, host, rating summary
- `GET /listings/{id}/availability` — booked date ranges (for disabling calendar days)
- `GET /listings/{id}/quote?check_in&check_out&guests` — price breakdown
- `GET /listings/{id}/reviews`, `POST /listings/{id}/reviews` (bonus: only for a completed stay by the author)
- `POST /listings`, `PUT /listings/{id}`, `DELETE /listings/{id}` (host)
- `GET /host/listings`, `GET /host/bookings` (bookings on my listings)
- `POST /bookings`, `GET /bookings/me` (trips: upcoming + past), `POST /bookings/{id}/cancel`
- `GET /wishlists`, `PUT /wishlists/{listing_id}`, `DELETE /wishlists/{listing_id}`
- Consistent error shape: `{"detail": "..."}` with correct status codes (400/403/404/409/422).

## Mock auth
- Frontend keeps `currentUserId` in an auth context (persisted in localStorage), sends it as `X-User-Id` on every request.
- Profile menu (top-right hamburger + avatar pill, like Airbnb) has "Log in as…" listing seeded users, plus "Switch to hosting / Switch to traveling".
- Logged-out users can browse; booking/wishlist actions open a login modal.

## Frontend routes
- `/` — explore: category icon row, listing grid, "Show more"/pagination. Same page handles search params (`?location=&checkIn=&checkOut=&guests=&...`).
- `/rooms/[id]` — detail page
- `/book/[id]?checkIn&checkOut&guests` — "Confirm and pay" page with mocked payment
- `/trips` — upcoming / past trips, cancel
- `/wishlists`
- `/hosting` — host dashboard (today/upcoming reservations + my listings)
- `/hosting/listings/new`, `/hosting/listings/[id]/edit`
- Placeholders ("Coming soon" modal/page): Messages, Identity verification, real payments.

## Airbnb look & feel (UI is graded — be precise)
Study current airbnb.com; when the user pastes screenshots, match them closely.
- Colors: brand `#FF385C` (hover `#E00B41`, gradient on primary button), text `#222222`, secondary `#6A6A6A`/`#717171`, borders `#DDDDDD`/`#EBEBEB`, bg `#F7F7F7` for subtle fills.
- Font: `Airbnb Cereal` isn't public → use a close sans (e.g. Inter / system-ui stack), weights 400/500/600/700.
- Radius: cards & images `12px`, buttons `8px`, search pill fully rounded with shadow `0 3px 12px rgba(0,0,0,.1)`.
- Header: logo left, search pill center (Where | When | Who + red circular search button), "Airbnb your home" + globe + profile menu right. Sticky with bottom border on scroll.
- Search pill expands into segments with dropdown panels: destination suggestions, 2-month range calendar, guest counters (adults/children/infants/pets).
- Category row: icon + label, active = black underline, horizontally scrollable with arrow buttons, "Filters" button opening a modal (price range, property type, rooms & beds, amenities, "Show N places" footer).
- Listing card: square-ish image (aspect ≈ 20/19) with hover arrows + dots carousel, heart top-right, "Guest favourite" badge optional; below: "City, Country" bold + ★ rating, distance/dates grey, "**₹X** night".
- Grid: 1/2/3/4/5/6 columns across breakpoints.
- Detail page: title + share/save, 1 large + 4 small photo grid with "Show all photos" modal, left column (type summary, host row, highlights, description, amenities with "Show all", calendar), right column **sticky booking card** (price, date + guest selector, red "Reserve", "You won't be charged yet", breakdown), reviews (rating summary + 2-col review cards), map, "Meet your host".
- Toasts for: booking confirmed, saved/removed from wishlist, listing created/updated/deleted, errors.
- No dark mode (airbnb.com has none; it would reduce similarity).

## Seed data (must make the app immediately usable)
- ~6 hosts (2 superhosts), ~4 guests.
- ~48 listings across varied places (Goa, Manali, Jaipur, Udaipur, Mumbai, Rishikesh, Coorg, Bali, Lisbon, Paris, Tokyo, NYC, …) with realistic lat/lng, mixed property types/categories/prices.
- 5 images per listing from Unsplash. **Write a small script that HEAD-checks every image URL and replace any that don't return 200** — never ship broken images.
- ~25 bookings (mix of past and future), reviews on past stays, a few wishlist items.
- Seed is idempotent: runs on startup only if the DB is empty; `python -m app.seed.seed --reset` reseeds.

## Working rules for Claude Code
- Work **one phase at a time**; stop at the end of each phase and report.
- After each phase: run the app/tests, fix errors, then `git commit` with a clear message (small, frequent commits — the history shows original work).
- Never copy code from existing Airbnb-clone repositories (plagiarism = disqualification).
- Don't add features outside this spec before all must-haves work end-to-end.
- Keep env config in `.env.example` files; never hardcode URLs (`NEXT_PUBLIC_API_URL`, `FRONTEND_ORIGIN`, `DATABASE_URL`).
