# Backend (FastAPI)

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env         # macOS/Linux: cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/api/health · API docs: http://localhost:8000/docs

## Seed data

The server creates tables and seeds automatically on startup **if the DB is empty**. Manually:

```bash
python -m app.seed.seed           # seed only if empty, then print row counts
python -m app.seed.seed --reset   # drop everything and reseed
python -m scripts.check_images    # HEAD-check every seed image URL (exit 1 on any failure)
```

Bookings are generated relative to today's date, so there are always upcoming and past trips.
Seeded users can be impersonated via the `X-User-Id` header (ids 1–6 are hosts, 7–10 guests).

## Tests

```bash
pytest
```

## Dependencies
- `fastapi` — web framework / routing / validation
- `uvicorn[standard]` — ASGI server
- `sqlalchemy` — ORM (2.0 typed models)
- `pydantic-settings` — typed settings from env vars
- `pytest` — tests
- `httpx` — required by FastAPI's `TestClient`
