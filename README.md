# PROCHEECK

Construction safety training & certification platform for the Mexican market (NOM/STPS/DC-3 compliance).

## Structure

```
procheeck/
├── frontend/   # Next.js 15 (App Router) + shadcn/ui + Tailwind + i18n (es/en)
└── backend/    # NestJS REST API + JWT + Postgres (TypeORM)
```

## Prerequisites

- Node.js >= 20
- pnpm or npm
- PostgreSQL >= 14

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env         # fill in DB creds + JWT secret
npm install
npm run start:dev            # http://localhost:4000
```

Health check: `GET http://localhost:4000/api/health`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:3000
```

## Roles

Five distinct dashboard experiences:

1. **Principal Admin** — platform owner
2. **Client** — contracting company (buys courses)
3. **Client Admin** — manages a Client's users & subcontractors
4. **Subcontractor** — company hired by a Client
5. **Employee** — individual learner

## Database

Initial schema lives in [backend/src/database/schema.sql](backend/src/database/schema.sql). Apply it with:

```bash
psql -U postgres -d procheeck -f backend/src/database/schema.sql
```

## i18n

Message files: [frontend/messages/es.json](frontend/messages/es.json) and [frontend/messages/en.json](frontend/messages/en.json). Spanish is the default locale.
