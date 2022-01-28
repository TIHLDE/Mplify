from typing import Generator

from sqlmodel import Session, SQLModel, create_engine

# from sqlmodel.ext.asyncio.session import AsyncSession, AsyncEngine

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
# sqlite_url2 = f"sqlite+aiosqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
# async_engine = AsyncEngine(
#     create_engine(sqlite_url2, echo=True, connect_args=connect_args)
# )
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)


def create_db_and_tables() -> None:
    # SQLModel.metadata.create_all(engine)
    SQLModel.metadata.create_all(engine)
    # async with async_engine.begin() as conn:
    #     await conn.run_sync(SQLModel.metadata.create_all(engine))


def get_session() -> Generator:
    with Session(engine) as session:
        yield session
        # async with AsyncSession(async_engine) as session:
