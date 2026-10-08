from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models  # noqa: F401  (registers all tables on Base.metadata)
from app.config import settings
from app.db import Base, SessionLocal, engine, get_db
from app.seed.seed import seed_if_empty


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # Runs once when the server starts (not on import, so tests stay isolated).
    # No Alembic: tables are created here (see README assumptions).
    Base.metadata.create_all(bind=engine)
    # Seed only when the DB is empty, so restarts never duplicate or overwrite data.
    with SessionLocal() as db:
        seed_if_empty(db)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Airbnb Clone API", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    def health(db: Session = Depends(get_db)) -> dict[str, str]:
        # Touch the DB so a broken DATABASE_URL / missing volume shows up here.
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}

    return app


app = create_app()
