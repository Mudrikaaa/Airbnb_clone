from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models  # noqa: F401  (registers all tables on Base.metadata)
from app.config import settings
from app.db import Base, SessionLocal, engine, get_db
from app.errors import AppError
from app.routers import bookings, host, listings, meta, users, wishlists
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


async def handle_app_error(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


async def handle_validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
    """Keep the API's error shape consistent: `detail` is always a readable string.

    The full Pydantic error list is still returned under `errors` for debugging / form fields.
    """
    errors = jsonable_encoder(exc.errors())
    first = errors[0] if errors else {}
    field = ".".join(str(part) for part in first.get("loc", []) if part not in ("body", "query", "path"))
    message = str(first.get("msg", "Invalid request")).removeprefix("Value error, ")
    detail = f"{field}: {message}" if field else message
    return JSONResponse(status_code=422, content={"detail": detail, "errors": errors})


def create_app() -> FastAPI:
    app = FastAPI(title="Airbnb Clone API", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_exception_handler(AppError, handle_app_error)
    app.add_exception_handler(RequestValidationError, handle_validation_error)

    for module in (users, meta, listings, bookings, host, wishlists):
        app.include_router(module.router, prefix="/api")

    @app.get("/api/health", tags=["meta"])
    def health(db: Session = Depends(get_db)) -> dict[str, str]:
        # Touch the DB so a broken DATABASE_URL / missing volume shows up here.
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}

    return app


app = create_app()
