# Deployment Readiness

## Completed verification

- Backend CI tests generation, PDF pagination, fresh PostgreSQL 16 migrations, schema drift, API/database workflows, and guarded reset rollback.
- Synthetic PDFs were generated through CI and reviewed by the project owner.
- The existing Railway demo database `railway` was erased and recreated through Alembic on 2026-10-29. Both reset and schema verification passed: https://github.com/osid54/teachers-pet/actions/runs/40938220018.
- The reset did not deploy the backend branch, merge code, rotate signing secrets, or change Railway's connected branch.

## Before any deployment

1. Rotate Railway's `SECRET_KEY` directly in its secret settings to invalidate old demo tokens. Do not copy the key into chat, frontend variables, Git, or CI test configuration. Clear old browser sign-in data.
2. Verify Railway's service root is `backend`, the service uses this repository, and the intended deployment branch/automatic-deploy policy is correct. Neither Railway dashboard settings nor its actual deployment source have been inspected through an authorized Railway connection here.
3. Keep `DATABASE_URL` pointing to the existing PostgreSQL service, using its private URL inside Railway. Leave `SQL_ECHO` unset or false. Do not replace the service or run the demo reset again.
4. Confirm Railway reads `backend/railway.json` and detects Python 3.12 from `.python-version`. Its pre-deploy command is `python -m alembic upgrade head`; start remains `python main.py`. Review dashboard overrides before triggering deployment.
5. Remove the temporary `RAILWAY_DATABASE_URL` secret from the GitHub `demo-database-reset` environment when no longer needed. Removing it is a separate explicit administrative action; ordinary test jobs do not use it.
6. Wait for checks on both feature PRs and their proposed merge state. Merge into `dev` only after review; merging into a branch connected to Railway or Vercel may trigger deployments. Do not assume a draft PR disables every external hosting integration.

## Backend rollout

Deploy deliberately after approval. Verify the pre-deploy logs reach Alembic head without errors, application startup succeeds, and the public `/` health endpoint returns `{"status":"ok"}`. The current health endpoint checks process availability, not every database operation.

Railway's documented config-as-code format is deprecated and scheduled to stop working for legacy services after 2026-12-01. The existing config is retained for this readiness pass. Review Railway's infrastructure-as-code migration guide and the actual service settings before that date rather than silently replacing service configuration during this release.

## Frontend rollout

Use the Vite preset, root `frontend`, build command `npm run build`, and output `dist`. Set `VITE_API_BASE_URL` to the backend's public HTTPS origin. Confirm that origin accepts the deployed frontend's CORS origin. Frontend CI builds deliberately use a non-production URL and must not be published as production assets.

## Real-service smoke test

After deploying the intended backend/frontend revisions, use fresh disposable accounts:

- Register and log in; verify incorrect credentials and session expiry behave normally.
- Configure an arithmetic worksheet with non-default modifiers; generate and download the PDF.
- Generate multiple topics and a mixed worksheet; verify requested counts and answer keys.
- Save a private template, reload it, edit it, and verify an update does not create a duplicate.
- With a second account, confirm private templates cannot be read, edited, deleted, liked, or favorited.
- Make a template public, browse/filter it, like/favorite it, and verify counts and saved lists.
- Make it private again; verify another account no longer sees it in favorites.
- Delete the test templates and verify lists refresh. Check mobile sidebar/form usability and browser console errors.

CI verifies these contracts in isolation, not connectivity or configuration of the real Railway/Vercel services. Keep production rollout approval and schema migration review explicit for future changes.