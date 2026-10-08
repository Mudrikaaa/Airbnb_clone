"""Shared fixtures: every test gets a fresh in-memory SQLite DB wired into the app via get_db."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.models import Amenity, Listing, User
from tests.factories import make_listing


@pytest.fixture
def db():
    # StaticPool = one shared connection, so the in-memory DB survives across sessions in a test.
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    event.listen(engine, "connect", lambda conn, _: conn.execute("PRAGMA foreign_keys=ON"))
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        with TestSession() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    with TestSession() as session:
        yield session
    app.dependency_overrides.clear()
    engine.dispose()


@pytest.fixture
def client(db):
    # Not used as a context manager, so the app's startup seed never runs against the test DB.
    return TestClient(app)


@pytest.fixture
def host(db: Session) -> User:
    user = User(name="Hana Host", email="host@test.com")
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def guest(db: Session) -> User:
    user = User(name="Gita Guest", email="guest@test.com")
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def other_user(db: Session) -> User:
    user = User(name="Omar Other", email="other@test.com")
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def amenities(db: Session) -> list[Amenity]:
    items = [Amenity(name="Wifi", icon="Wifi"), Amenity(name="Pool", icon="Waves"), Amenity(name="Kitchen", icon="CookingPot")]
    db.add_all(items)
    db.commit()
    return items


@pytest.fixture
def listing(db: Session, host: User) -> Listing:
    return make_listing(db, host)
