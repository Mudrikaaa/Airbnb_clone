# Airbnb Clone

Full-stack Airbnb clone — Next.js (App Router, TypeScript, Tailwind) frontend + FastAPI / SQLAlchemy / SQLite backend.

## Run locally

Backend — see [backend/README.md](backend/README.md):

```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Deployment
- Frontend → Vercel (root directory `frontend`, env `NEXT_PUBLIC_API_URL`).
- Backend → Railway (root directory `backend`, volume mounted at `/data`, env `DATABASE_URL=sqlite:////data/airbnb.db`, `FRONTEND_ORIGIN`).

## Assumptions
- No Alembic: tables are created with `Base.metadata.create_all` on startup. Fine for an assignment with a seedable DB; a real product would use migrations.
- SQLite lives on a Railway volume so bookings survive restarts. (Render free tier disk is ephemeral — data would reset on redeploy.)
- Auth, payments, messaging and identity verification are mocked.
