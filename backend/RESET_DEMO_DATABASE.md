# Reset the Existing Demo Database

This procedure reuses the current PostgreSQL service. It permanently removes Teacher's Pet accounts, templates, likes, and favorites. The owner has authorized discarding those demo records. It does not create a replacement service.

## Before running

### Option A: GitHub runner, no local Python

Create the GitHub repository environment `demo-database-reset` in Settings > Environments. Add an environment secret named `RAILWAY_DATABASE_URL` using this project's existing PostgreSQL service's public TCP connection URL. Set the value directly in GitHub; do not send it through chat. GitHub-hosted runners cannot resolve Railway-private hostnames.

Restrict the environment to the `backend-stabilization` branch and enable required-reviewer approval if your GitHub plan supports it. The environment is only a GitHub access-control boundary, not a new Railway service or database.

Run the `Backend Tests` workflow on `backend-stabilization` manually, explicitly enable `erase_demo_data`, and provide the database name. The reset job is skipped on pushes, PRs, and manual runs without that checkbox. It waits for both test jobs to pass and then for any configured environment approval. The secret never goes into the test jobs or PDF artifacts. If this branch's workflow is not listed in GitHub's manual-run UI, request dispatch of the registered workflow on that branch through the GitHub API/CLI instead of merging unverified changes into production just to expose the button.

Only enable the checkbox after verifying the Railway service/connection and pausing application requests. After success, remove the temporary secret if you no longer need runner-based resets. Do not retry an interrupted run without inspecting commit status.

### Option B: An existing trusted Python environment

1. Use the `backend-stabilization` code only after its `Backend Tests` workflow's database job passes.
2. Stop application requests while the reset runs. Do not stop or delete the PostgreSQL service.
3. Use a trusted Python 3.12 environment with backend dependencies installed and access to the existing PostgreSQL service. Railway-internal hostnames require execution inside Railway's network; an external machine needs the database's public TCP connection URL.
4. Provide `DATABASE_URL` through that environment's secret configuration. Never paste it into chat, commit it, or put it in command arguments. Existing Railway environment variables are not automatically available on this development PC.

## Verify the target

In the database console, run this read-only query:

```sql
SELECT current_database(), current_user;
```

Confirm that the connection belongs to this project's existing Railway PostgreSQL service. The database name alone is not unique across Railway services, so verify the service/connection too.

## Erase and recreate

From `backend/` in the trusted execution environment, replace `EXACT_DATABASE_NAME` with the result above:

```sh
python reset_demo_database.py --confirm-database EXACT_DATABASE_NAME --confirm ERASE_TEACHERS_PET_DEMO
```

The command drops only these `public` tables and recreates the schema through the checked-in Alembic migrations:

- `user_favorites_template`
- `user_likes_template`
- `templates`
- `users`
- `alembic_version`

It does not use `DROP SCHEMA` or `CASCADE`. Unexpected foreign-key dependencies stop the reset rather than delete unrelated objects. Dropping tables and applying migrations share one transaction: ordinary SQL or migration failures roll it back. A network interruption can leave the client unsure of commit status; inspect the database before retrying.

## Verify before reopening the app

```sh
python -m alembic current
python -m alembic check
```

Confirm all four application tables are empty and `alembic_version` records the repository's head revision. Then:

- Rotate the backend `SECRET_KEY` so old demo tokens cannot authenticate against newly registered users with reused usernames.
- Restart the backend with the same database service connection.
- Register fresh test accounts, generate a worksheet, and exercise template save/edit/delete and private/public access.
- Clear old browser auth and saved-template data if it references erased records.
- Enable deploy-time `alembic upgrade head` only after reset verification; never configure the erase command as a startup or pre-deploy step.

No reset runs on ordinary CI pushes, PRs, or deployments. Only the explicitly enabled manual `reset-demo` job can target the existing Railway service. The normal CI database job always uses its disposable `teachers_pet_ci` PostgreSQL container.