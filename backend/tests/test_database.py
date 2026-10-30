import asyncio
import importlib
import os
import unittest
from pathlib import Path

from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import DBAPIError

from reset_demo_database import CONFIRMATION, reset_database


@unittest.skipUnless(os.environ.get("TEST_DATABASE_URL"), "Requires disposable PostgreSQL test database")
class DatabaseWorkflowTests(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        cls.database_url = os.environ["TEST_DATABASE_URL"]
        if make_url(cls.database_url).database != "teachers_pet_ci":
            raise RuntimeError("Database tests only run against the disposable teachers_pet_ci database.")
        os.environ["DATABASE_URL"] = cls.database_url
        os.environ["SECRET_KEY"] = "ci-only-secret-not-for-production"
        cls.database = importlib.import_module("database")
        if cls.database.DATABASE_URL != cls.database_url:
            raise RuntimeError("Database module was initialized with a different connection URL.")
        cls.api = importlib.import_module("main")
        cls.config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
        command.upgrade(cls.config, "head")

    async def asyncSetUp(self):
        import httpx
        async with self.database.engine.begin() as connection:
            await connection.execute(text(
                "TRUNCATE user_favorites_template, user_likes_template, templates, users RESTART IDENTITY"
            ))
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=self.api.app), base_url="http://test")

    async def asyncTearDown(self):
        await self.client.aclose()
        await self.database.engine.dispose()

    async def account(self, username):
        response = await self.client.post("/register", json={
            "username": username, "email": f"{username}@example.invalid", "password": "ci-test-password",
        })
        self.assertIn(response.status_code, (200, 201), response.text)
        response = await self.client.post("/token", data={"username": username, "password": "ci-test-password"})
        self.assertEqual(response.status_code, 200, response.text)
        return {"Authorization": f"Bearer {response.json()['access_token']}"}

    async def template(self, headers, public=False):
        response = await self.client.post("/templates/", headers=headers, json={
            "name": "CI practice", "description": "Disposable test record", "is_public": public,
            "tags": ["Arithmetic"], "settings_json": {"selectedTopicInstances": [], "uniformSettings": {}},
        })
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()["id"]

    async def test_migrations_match_models(self):
        await asyncio.to_thread(command.check, self.config)

    async def test_account_and_template_authorization(self):
        owner = await self.account("ci-owner")
        other = await self.account("ci-other")
        template_id = await self.template(owner)
        response = await self.client.get("/users/me", headers=owner)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "ci-owner")
        self.assertEqual((await self.client.get(f"/templates/{template_id}")).status_code, 403)
        self.assertEqual((await self.client.get(f"/templates/{template_id}", headers=other)).status_code, 403)
        self.assertEqual((await self.client.put(f"/templates/{template_id}", headers=other, json={"name": "Not mine"})).status_code, 403)
        self.assertEqual((await self.client.delete(f"/templates/{template_id}", headers=other)).status_code, 403)
        response = await self.client.put(f"/templates/{template_id}", headers=owner, json={"name": "Updated"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], "Updated")
        self.assertEqual((await self.client.delete(f"/templates/{template_id}", headers=owner)).status_code, 204)

    async def test_public_filters_likes_favorites_and_deletion(self):
        owner = await self.account("ci-owner")
        other = await self.account("ci-other")
        template_id = await self.template(owner, public=True)
        response = await self.client.get(f"/templates/{template_id}")
        self.assertEqual(response.status_code, 200)
        response = await self.client.get("/templates/public", params={"tags": "Arithmetic", "q": "practice"})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual([item["id"] for item in response.json()], [template_id])
        response = await self.client.post(f"/templates/{template_id}/like", headers=other)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["likes_count"], 1)
        response = await self.client.post(f"/templates/{template_id}/favorite", headers=other)
        self.assertEqual(response.status_code, 200, response.text)
        saved = await self.client.get("/templates/saved", headers=other, params={"tags": "Arithmetic"})
        self.assertEqual(saved.status_code, 200, saved.text)
        self.assertEqual([item["id"] for item in saved.json()], [template_id])
        self.assertEqual((await self.client.delete(f"/templates/{template_id}", headers=owner)).status_code, 204)
        saved = await self.client.get("/templates/saved", headers=other)
        self.assertEqual(saved.json(), [])

    async def test_private_templates_cannot_be_liked_or_favorited_by_others(self):
        owner = await self.account("ci-owner")
        other = await self.account("ci-other")
        template_id = await self.template(owner)
        for action in ("like", "favorite"):
            response = await self.client.post(f"/templates/{template_id}/{action}", headers=other)
            self.assertEqual(response.status_code, 403, response.text)

    async def test_favorite_does_not_expose_template_after_owner_makes_it_private(self):
        owner = await self.account("ci-owner")
        other = await self.account("ci-other")
        template_id = await self.template(owner, public=True)
        await self.client.post(f"/templates/{template_id}/favorite", headers=other)
        await self.client.put(f"/templates/{template_id}", headers=owner, json={"is_public": False})
        saved = await self.client.get("/templates/saved", headers=other)
        self.assertEqual(saved.status_code, 200)
        self.assertEqual(saved.json(), [])

    async def test_generates_pdf_from_ordered_single_and_mixed_sections(self):
        response = await self.client.post("/generate-worksheet", json={
            "seed": 54,
            "answer_key_mode": "inline",
            "sections": [
                {"mode": "single", "page_count": 1, "problems_per_page": 2,
                 "topics": [{"topic_id": "addition", "modifiers": {
                     "digits": 3, "digit_mode": "strict", "decimal_places": 2,
                     "negative_probability": 0, "answer_rounding": 2,
                 }}]},
                {"mode": "mixed", "page_count": 1, "problems_per_page": 3,
                 "topics": [
                    {"topic_id": "addition", "modifiers": {}},
                    {"topic_id": "subtraction", "modifiers": {"negative_probability": 0.25}},
                ]},
            ],
        })
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.headers["content-type"], "application/pdf")
        self.assertTrue(response.content.startswith(b"%PDF-"))

    async def test_rejects_empty_sections_and_invalid_mixed_section(self):
        response = await self.client.post("/generate-worksheet", json={"sections": []})
        self.assertEqual(response.status_code, 422)
        response = await self.client.post("/generate-worksheet", json={"sections": [{
            "mode": "mixed", "topics": [{"topic_id": "addition"}],
        }]})
        self.assertEqual(response.status_code, 422)

    async def test_reset_erases_records_and_recreates_migration_head(self):
        owner = await self.account("ci-owner")
        await self.template(owner)
        await self.database.engine.dispose()
        await reset_database(self.database_url, "teachers_pet_ci", CONFIRMATION)
        async with self.database.engine.connect() as connection:
            self.assertEqual(await connection.scalar(text("SELECT count(*) FROM users")), 0)
            self.assertEqual(await connection.scalar(text("SELECT count(*) FROM templates")), 0)
            revision = await connection.scalar(text("SELECT version_num FROM alembic_version"))
            self.assertEqual(revision, ScriptDirectory.from_config(self.config).get_current_head())
        await asyncio.to_thread(command.check, self.config)

    async def test_reset_rolls_back_if_unrelated_table_references_application_data(self):
        owner = await self.account("ci-owner")
        async with self.database.engine.begin() as connection:
            await connection.execute(text("CREATE TABLE reset_guard_reference (user_id integer REFERENCES users(id))"))
            await connection.execute(text("INSERT INTO reset_guard_reference (user_id) VALUES (1)"))
        try:
            with self.assertRaises(DBAPIError):
                await reset_database(self.database_url, "teachers_pet_ci", CONFIRMATION)
            async with self.database.engine.connect() as connection:
                self.assertEqual(await connection.scalar(text("SELECT count(*) FROM users")), 1)
        finally:
            async with self.database.engine.begin() as connection:
                await connection.execute(text("DROP TABLE reset_guard_reference"))