import argparse
import asyncio
import os
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine


CONFIRMATION = "ERASE_TEACHERS_PET_DEMO"


async def reset_database(database_url, expected_database, confirmation):
    if confirmation != CONFIRMATION or not expected_database:
        raise ValueError("An exact database name and explicit reset confirmation are required.")
    url = make_url(database_url)
    if url.drivername not in ("postgresql", "postgresql+asyncpg"):
        raise ValueError("Only PostgreSQL databases are supported.")
    if url.database != expected_database:
        raise ValueError("Configured database does not match the confirmed database name.")
    engine = create_async_engine(url.set(drivername="postgresql+asyncpg"), echo=False)
    try:
        async with engine.begin() as connection:
            actual_database = await connection.scalar(text("SELECT current_database()"))
            if actual_database != expected_database:
                raise ValueError("Connected database does not match the confirmed database name.")
            await connection.execute(text("SET LOCAL lock_timeout = '10s'"))
            await connection.execute(text("SET LOCAL statement_timeout = '60s'"))
            await connection.execute(text(
                "DROP TABLE IF EXISTS public.user_favorites_template, public.user_likes_template, "
                "public.templates, public.users, public.alembic_version"
            ))

            def recreate_schema(sync_connection):
                config = Config(str(Path(__file__).parent / "alembic.ini"))
                config.attributes["connection"] = sync_connection
                command.upgrade(config, "head")

            await connection.run_sync(recreate_schema)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Erase Teacher's Pet demo tables and recreate them through Alembic.")
    parser.add_argument("--confirm-database", required=True, help="Exact database name, not a connection URL.")
    parser.add_argument("--confirm", required=True, choices=[CONFIRMATION])
    arguments = parser.parse_args()
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        parser.error("DATABASE_URL must be configured securely in the execution environment.")
    try:
        asyncio.run(reset_database(database_url, arguments.confirm_database, arguments.confirm))
    except Exception:
        raise SystemExit("Reset failed; the transaction was rolled back. Check target, permissions, locks, and migration history without sharing credentials.")
    print("Teacher's Pet demo tables recreated successfully. Existing application records have been erased.")