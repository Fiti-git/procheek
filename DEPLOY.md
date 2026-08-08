# PROCHEECK — Deployment guide

Single-server Docker Compose deployment. Suitable for a small VPS (2 vCPU / 4 GB RAM to start).

## 1. Prerequisites

- Ubuntu 22.04 LTS (or any modern Linux with Docker)
- Docker 24+ and Docker Compose v2
- A domain pointed at the server (e.g. `app.procheeck.mx`, `api.procheeck.mx`)
- A reverse proxy in front (Caddy / Nginx / Traefik) to handle TLS

## 2. First-time setup

```bash
git clone <repo> /opt/procheeck
cd /opt/procheeck
cp .env.production.example .env
$EDITOR .env        # set DB_PASSWORD, JWT_SECRET, RESEND_API_KEY, APP_URL, NEXT_PUBLIC_API_URL
docker compose build
docker compose up -d
docker compose exec backend npm run seed   # creates demo users + 5 NOM courses
```

Services:

| Service   | Port  | Purpose                                          |
| --------- | ----- | ------------------------------------------------ |
| frontend  | 3000  | Next.js app                                      |
| backend   | 4000  | NestJS API (`/api`)                              |
| postgres  | 5433  | Database (host mapping — internal is 5432)      |
| backup    |  —    | Daily `pg_dump` to `procheeck_backups` volume    |

Swagger UI: `http://localhost:4000/api/docs` (disable in prod via `SWAGGER_ENABLED=false`).

## 3. Reverse proxy (Caddy example)

```
app.procheeck.mx {
  reverse_proxy localhost:3000
}
api.procheeck.mx {
  reverse_proxy localhost:4000
}
```

Set `NEXT_PUBLIC_API_URL=https://api.procheeck.mx/api` and `APP_URL=https://app.procheeck.mx` in `.env`, then `docker compose up -d --build`.

## 4. Backups

Automatic `pg_dump` runs daily at 03:00 UTC (override with `BACKUP_CRON`). Files land in the `procheeck_backups` volume, retained for `BACKUP_KEEP_DAYS` (default 14).

Manual backup:

```bash
docker compose exec backup /usr/local/bin/backup.sh
```

Copy backups off-box:

```bash
docker run --rm -v procheeck_backups:/backups -v $(pwd):/out alpine \
  sh -c 'cp -r /backups/. /out/backups/'
```

Restore:

```bash
gunzip -c procheeck-YYYYMMDD-HHMMSS.sql.gz | \
  docker compose exec -T postgres psql -U $DB_USER -d $DB_NAME
```

## 5. Updates

```bash
cd /opt/procheeck
git pull
docker compose build
docker compose up -d
```

The Postgres volume persists across restarts. Schema changes are applied via `schema.sql` on **first-time init only**; for schema edits after that, add a migration in `backend/src/database/migrations/`.

## 6. Health checks

- `GET /api/health` — liveness
- `docker compose ps` — service status
- `docker compose logs -f backend` — API logs

## 7. Rotating secrets

`.env` is read at container start, so `docker compose up -d` after editing is enough. Users stay logged in as long as their existing JWTs are still valid — rotate `JWT_EXPIRES_IN` if you need to force reauth.
