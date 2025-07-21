import os
import sys
from pathlib import Path

backend_path = Path(__file__).parent
sys.path.append(str(backend_path))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from models import Base

raw_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://teacherspetuser:teacherspetsecretpassword@localhost/teachers_pet_db")

if raw_url.startswith("postgresql://"):
    raw_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

DATABASE_URL = raw_url

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
        await session.close()

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
