from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.db import Base, engine, get_db


def create_app() -> FastAPI:
    app = FastAPI(title="Airbnb Clone API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # No Alembic: tables are created on startup (see README assumptions).
    Base.metadata.create_all(bind=engine)

    @app.get("/api/health")
    def health(db: Session = Depends(get_db)) -> dict[str, str]:
        # Touch the DB so a broken DATABASE_URL / missing volume shows up here.
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}

    return app


app = create_app()
