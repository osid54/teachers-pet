# Backend Verification on Another PC

The demo data is now explicitly disposable. For a reset within the existing Railway PostgreSQL service, follow `RESET_DEMO_DATABASE.md` instead of trying to preserve/baseline those demo rows. The reset still requires a verified connection and does not run automatically.

## GitHub CI without the other PC

The `Backend Tests` GitHub Actions workflow runs Python 3.12 syntax/generation tests and a separate PostgreSQL 16 job for fresh migrations, schema drift, database reset safety, and API/database workflows on relevant pushes and PRs. Open the repository's Actions tab to inspect results.

Normal push/PR test jobs use only a disposable `teachers_pet_ci` database and do not receive Railway credentials or deploy. The optional `reset-demo` job is different: it can access the existing Railway database only when manually requested on `backend-stabilization`, after tests pass, using the `demo-database-reset` environment's secret and any configured approval. See `RESET_DEMO_DATABASE.md` before enabling it. A green test run does not mean the Railway database was reset. Share failing test output rather than credentials.

## 1. Get the correct branch

Commit history was rewritten to correct authorship. Prefer a fresh clone rather than pulling into an old checkout with diverged commits:

```powershell
git clone --branch backend-stabilization https://github.com/osid54/teachers-pet.git teachers-pet-backend-check
cd teachers-pet-backend-check/backend
```

Use Python 3.12. The previous Python 3.9 documentation does not reflect the minimum versions required by all pinned dependencies.

## 2. Install and run tests without a database

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m compileall -q .
```

On macOS/Linux, use `python3.12` to create the environment and `.venv/bin/python` afterward. Without `TEST_DATABASE_URL`, database integration tests are skipped and the other tests use dummy configuration. The integration suite refuses any database name other than `teachers_pet_ci`; leave it to CI unless deliberately provisioning a disposable test database. Do not use Railway credentials for automated tests.

Record the Python version, failing test names, and complete tracebacks. The suite covers request guards, PDF pagination/samples, and (in the separate database job) migrations and API/database workflows. Passing tests do not certify every visual or deployment behavior.

## 3. Inspect real PDFs locally

You can download PDFs without Python: open a successful **Backend Tests** run in GitHub's Actions tab, scroll to **Artifacts**, and download `backend-pdf-samples-<run number>`. Extract the ZIP and open the five PDFs. `manifest.json` lists expected page/problem counts; `README.txt` lists visual checks. Artifacts expire after 14 days. They contain synthetic data only.

To reproduce the artifact on a Python PC, run `python -m pdf_generator.samples --output-dir artifacts/pdf-samples` from `backend/`. This command does not import the API, use environment credentials, or connect to a database. Do not commit generated PDFs.

Call `pdf_generator.main.create_pdf_worksheet` directly from a local script using synthetic section/problem dictionaries, then write the returned buffer to a PDF. No API server or database is needed. The existing pagination test demonstrates the input shape.

Review these cases, adding regression tests for failures:

- 1, 6, 10, and 50 problems per page; one and multiple requested pages.
- Multiple sections, including partial final rows, with continuous question numbering.
- Answer keys enabled and disabled; every answer must match its numbered question.
- All four arithmetic operations, mixed problems, five-digit operands, negatives, and five decimal places.
- Long operands, headings, and answers: no clipping, overlaps, unexpected extra pages, or missing working space.

The new five-column layout is not yet visually verified. In particular, verify that 50 problems actually fit the requested page count. Fix failures before merging or deploying.

## 4. Verify migrations on a disposable database

This is separate from the database-free tests and can use a temporary container or disposable hosted database; no permanent PostgreSQL installation is required. Never point migration experiments at the live Railway database.

Set `DATABASE_URL` for the disposable database, then run `alembic upgrade head` and `alembic check`. Also test upgrading a populated older schema: the historical tags migration adds a non-null column without a backfill and needs particular care. Do not silently rewrite migration history already applied to production.

## 5. Inspect Railway before enabling deployment migrations

Take a backup first. Using Railway's database console, inspect the schema and run this read-only query:

```sql
SELECT to_regclass('public.alembic_version');
```

If the table exists, inspect `SELECT version_num FROM alembic_version;`. Compare the actual tables, columns, constraints, and revision with the checked-in migrations. An absent version table does not mean the database is empty: the old app created tables at startup.

Do not run `alembic stamp head`, reset tables, or enable automatic migrations simply to silence errors. A stamp is appropriate only after proving the schema matches that revision. Review the backfill/baseline plan before any live write.

## 6. Deployment gate

- Confirm `DATABASE_URL` and `SECRET_KEY` are configured on Railway; keep `SQL_ECHO` off.
- Confirm the Railway service root and connected deployment branch before pushing deployment changes.
- Automatic migrations are intentionally not configured in the branch's Railway file. Inspect dashboard overrides too.
- Review builder/config changes against the existing working Railway service before deploying.
- After tests and migration-baseline verification pass, open a PR into `dev`; deploy deliberately rather than merging unverified changes into production.

Send back test output, PDF observations, and schema/revision findings without passwords, connection strings, or tokens.