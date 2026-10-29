# Other-PC Handoff: Deployment Diagnosis and Backend Verification

Updated 2026-10-29. Local Python is optional for the first troubleshooting steps below.

## Completed work and current blocker

- Backend PR #19 and frontend PR #20 were merged into `dev`; release PR #21 was merged into `production`. The owner reports both services were deployed.
- Frontend lint, 33 mocked tests, build, and backend PostgreSQL/PDF CI passed. The owner reviewed the generated PDF samples successfully.
- The existing Railway demo database `railway` was reset through Alembic and schema verification passed: https://github.com/osid54/teachers-pet/actions/runs/40938220018.
- The latest public probe of `https://teachers-pet-production.up.railway.app/` returned HTTP 502 from `railway-hikari`, with `Application failed to respond`. Health and CORS-preflight requests failed. Diagnose backend reachability/startup before changing CORS again.
- The frontend URL `https://teachers-pet-git-production-osid54s-projects.vercel.app` redirects unauthenticated visitors to Vercel login, so its baked-in API target was not inspected remotely.
- Signing-key rotation, hosting dashboard settings, and the real-service smoke test have not been independently confirmed.

Do not repeat the database reset, stamp the schema, create another service, or drop tables to follow this handoff. The reset is complete. `DEPLOYMENT_CHECKLIST.md` provides broader release checks; the immediate priority is the deployed API failure.

## Priority 1: Resolve Railway's 502

1. Select the FastAPI service in Railway, not PostgreSQL. Open its latest deployment and note the deployed commit SHA.
2. Read build, pre-deploy, and runtime logs. Capture the first failing step and complete traceback, without variable dumps or credentials.
3. Verify repository `osid54/teachers-pet`, deployment branch `production`, root `/backend`, and config file `backend/railway.json`. Confirm the actual deployment reads that file and Python 3.12 is selected from `backend/.python-version`.
4. Pre-deploy should run `python -m alembic upgrade head`; start should run `python main.py`. Never configure the demo reset as a start/pre-deploy command.
5. Confirm `DATABASE_URL` and `SECRET_KEY` exist on the FastAPI service in the correct Railway environment. Use the existing PostgreSQL service's private URL inside Railway; keep `SQL_ECHO` unset or false. Verify values in Railway directly, not through chat.
6. Look for Uvicorn listening on `0.0.0.0` and the assigned `PORT`. Check that the public domain routes to that service and matching port. A build/deploy success indicator does not establish that the domain reaches the running process.

Check public health from PowerShell without credentials:

```powershell
Invoke-WebRequest -Uri 'https://teachers-pet-production.up.railway.app/' -TimeoutSec 30
```

Expected: HTTP 200 and `{"status":"ok"}`. If it is still 502, inspect Railway logs and domain routing. Health checks process availability, not all database operations. Preserve local edits and make targeted fixes on a new branch rather than weakening CORS or resetting data to mask a startup failure.

## Priority 2: Verify Vercel's API configuration and CORS

Once backend health responds:

1. Verify the Vite preset, root `frontend`, build command `npm run build`, output `dist`, and intended production deployment SHA.
2. Set `VITE_API_BASE_URL=https://teachers-pet-production.up.railway.app` in the Vercel environment used by this deployment. The old `NEXT_PUBLIC_API_BASE_URL` is not read by Vite. Never use a PostgreSQL connection URL or secret here.
3. Redeploy after changing the variable: Vite embeds it at build time. An absent value falls back to `http://localhost:5000`, which points to each visitor's device, not Railway.
4. In your authenticated browser's Network tab, reproduce the error and inspect the failed request URL, method, status, and response. Check whether it targets Railway, localhost, HTTP rather than HTTPS, or an unexpected host/path. Do not share authorization headers or cookies.
5. The production branch's allowlist includes the frontend origin above. Confirm the Railway deployment contains that commit. Origins must match exactly, with no path or trailing slash. Do not replace the allowlist with a wildcard to address a 502.

Read-only preflight check from PowerShell:

```powershell
Invoke-WebRequest -Method Options -Uri 'https://teachers-pet-production.up.railway.app/templates/public' -Headers @{
	Origin = 'https://teachers-pet-git-production-osid54s-projects.vercel.app'
	'Access-Control-Request-Method' = 'GET'
	'Access-Control-Request-Headers' = 'content-type'
} -TimeoutSec 30
```

Expected: a successful response with `Access-Control-Allow-Origin` equal to the frontend origin. Railway's gateway-generated 502 lacks application CORS headers and may surface as a browser network/CORS error. A passing GET preflight does not certify every authenticated POST/PUT; inspect the actual failing request too.

## Priority 3: Complete real-service verification

- Rotate Railway's `SECRET_KEY` if not already done and clear stale browser sign-in data. Do not rotate repeatedly merely to troubleshoot a 502.
- After health and routing work, test fresh registration/login, worksheet configuration, PDF generation/download, template save/reload/edit/delete, filters, and private access using a second account.
- Remove the temporary GitHub `RAILWAY_DATABASE_URL` reset environment secret if no longer needed. Keep Railway's application `DATABASE_URL` intact.
- Do not deploy CI build artifacts as production assets: frontend CI deliberately uses a non-production API URL.

## GitHub CI without the other PC

The `Backend Tests` GitHub Actions workflow runs Python 3.12 syntax/generation tests and a separate PostgreSQL 16 job for fresh migrations, schema drift, database reset safety, and API/database workflows on relevant pushes and PRs. Open the repository's Actions tab to inspect results.

Normal push/PR test jobs use only a disposable `teachers_pet_ci` database and do not receive Railway credentials or deploy. The optional `reset-demo` job is different: it can access the existing Railway database only when manually requested on `backend-stabilization`, after tests pass, using the `demo-database-reset` environment's secret and any configured approval. See `RESET_DEMO_DATABASE.md` before enabling it. A green test run does not mean the Railway database was reset. Share failing test output rather than credentials.

## Optional Local Work 1: Get the deployed code

Commit history was rewritten to correct authorship. Prefer a fresh clone rather than pulling into an old checkout with diverged commits:

```powershell
git clone --branch production https://github.com/osid54/teachers-pet.git teachers-pet-backend-check
cd teachers-pet-backend-check/backend
```

Record `git rev-parse HEAD` and compare it with Railway's deployed SHA. For an existing checkout, inspect `git status` before fetching/switching branches and preserve uncommitted changes. Do not reset an older checkout blindly after the history rewrite.

Use Python 3.12. No local PostgreSQL installation is needed for database-free tests or synthetic PDF generation.

## Optional Local Work 2: Install and test without a database

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m compileall -q main.py database.py models.py pdf_generator problem_generator tests
```

On macOS/Linux, use `python3.12` to create the environment and `.venv/bin/python` afterward. Without `TEST_DATABASE_URL`, database integration tests are skipped and the other tests use dummy configuration. The integration suite refuses any database name other than `teachers_pet_ci`; leave it to CI unless deliberately provisioning a disposable test database. Do not use Railway credentials for automated tests.

Record the Python version, failing test names, and complete tracebacks. The suite covers request guards, PDF pagination/samples, and (in the separate database job) migrations and API/database workflows. Passing tests do not certify every visual or deployment behavior.

## Optional Local Work 3: Reproduce PDFs

You can download PDFs without Python: open a successful **Backend Tests** run in GitHub's Actions tab, scroll to **Artifacts**, and download `backend-pdf-samples-<run number>`. Extract the ZIP and open the five PDFs. `manifest.json` lists expected page/problem counts; `README.txt` lists visual checks. Artifacts expire after 14 days. They contain synthetic data only.

To reproduce the artifact on a Python PC, run `python -m pdf_generator.samples --output-dir artifacts/pdf-samples` from `backend/`. This command does not import the API, use environment credentials, or connect to a database. Do not commit generated PDFs.

Call `pdf_generator.main.create_pdf_worksheet` directly from a local script using synthetic section/problem dictionaries, then write the returned buffer to a PDF. No API server or database is needed. The existing pagination test demonstrates the input shape.

Review these cases, adding regression tests for failures:

- 1, 6, 10, and 50 problems per page; one and multiple requested pages.
- Multiple sections, including partial final rows, with continuous question numbering.
- Answer keys enabled and disabled; every answer must match its numbered question.
- All four arithmetic operations, mixed problems, five-digit operands, negatives, and five decimal places.
- Long operands, headings, and answers: no clipping, overlaps, unexpected extra pages, or missing working space.

The owner reviewed the CI sample PDFs successfully. Continue using these cases as regression checks whenever the layout changes.

## Optional Local Work 4: Migration regression tests

This is separate from the database-free tests and can use a temporary container or disposable hosted database; no permanent PostgreSQL installation is required. Never point migration experiments at the live Railway database.

Set `DATABASE_URL` for the disposable database, then run `alembic upgrade head` and `alembic check`. Also test upgrading a populated older schema: the historical tags migration adds a non-null column without a backfill and needs particular care. Do not silently rewrite migration history already applied to production.

## Reference: Future database baselines

The existing Railway demo database has already been recreated and verified at Alembic head. The following baseline inspection applies to a different or restored database, not as a request to repeat that completed operation.

Take a backup first. Using Railway's database console, inspect the schema and run this read-only query:

```sql
SELECT to_regclass('public.alembic_version');
```

If the table exists, inspect `SELECT version_num FROM alembic_version;`. Compare the actual tables, columns, constraints, and revision with the checked-in migrations. An absent version table does not mean the database is empty: the old app created tables at startup.

Do not run `alembic stamp head`, reset tables, or enable automatic migrations simply to silence errors. A stamp is appropriate only after proving the schema matches that revision. Review the backfill/baseline plan before any live write.

## What to send back

- Railway deployment SHA and the failing build/pre-deploy/runtime step, with its sanitized traceback.
- Health and preflight status codes; the browser's failed request URL, method, and status.
- Whether Vercel's `VITE_API_BASE_URL` is set in the right environment and the frontend was rebuilt afterward.
- Python version, failing test names, and complete tracebacks if local tests fail.
- Any PDF clipping/page-count/answer-key mismatch introduced by subsequent changes.

Never include passwords, full database connection URLs, JWTs, signing keys, or cookies. The current blocker is deployed API availability; a fresh database reset and another production merge are not the next diagnostic steps.