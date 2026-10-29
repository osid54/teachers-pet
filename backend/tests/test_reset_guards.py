import unittest

from reset_demo_database import CONFIRMATION, reset_database


class ResetGuardTests(unittest.IsolatedAsyncioTestCase):
    async def test_rejects_wrong_confirmation_before_connecting(self):
        with self.assertRaises(ValueError):
            await reset_database("postgresql+asyncpg://test:test@localhost/teachers_pet_ci", "teachers_pet_ci", "yes")

    async def test_rejects_wrong_database_before_connecting(self):
        with self.assertRaises(ValueError):
            await reset_database("postgresql+asyncpg://test:test@localhost/teachers_pet_ci", "another_database", CONFIRMATION)