# Reset the Existing Demo Database

This procedure reuses the current PostgreSQL service. It permanently removes Teacher's Pet accounts, templates, likes, and favorites. The owner has authorized discarding those demo records. It does not create a replacement service.

## Before running

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

No reset runs automatically from CI or ordinary deployments. The CI database job runs this procedure only against its disposable `teachers_pet_ci` PostgreSQL container.