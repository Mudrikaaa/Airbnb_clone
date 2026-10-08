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
