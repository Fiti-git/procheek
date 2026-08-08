# Client email — PROCHEECK build status

**Attachment to include:** `f:\Munas\procheeck\document\build-status.xlsx`

---

**To:** *(Ale)*
**Cc:** *(Munas)*
**Subject:** PROCHEECK — Build progress (13-Jul) + what we still need from you

---

Hi Ale,

Quick update on PROCHEECK — attached (**build-status.xlsx**, see the "Update 2026-07-13" tab) is what we shipped since the last note. Everything below is running end-to-end and demo-able today.

## Shipped this cycle

**Infrastructure & ops**
- Frontend is now containerized — the whole stack (frontend + backend + Postgres) comes up with one `docker compose up -d`.
- Automated daily database backups (03:00 UTC, 14 days of history by default, easy to rotate off-server).
- GitHub Actions CI: every push builds the backend, frontend, and docker images so we catch regressions before deploy.
- Production environment template + deploy guide (`DEPLOY.md`) covering reverse-proxy, TLS via Caddy, backups, updates, restores.
- Sentry integration on both backend and frontend — opt-in with a DSN, so we can plug it in the moment you tell us which account to use.

**Backend features**
- **Certificate expiry reminders**: cron sends email + in-app notification at 30 / 15 / 1 days before a cert expires. Cuts down on lapsed compliance without anyone chasing it.
- **Admin audit log**: every sensitive admin action (cert issue/revoke, user invite/update/deactivate, company create/update/delete, course publish/unpublish/delete) is written to a permanent `audit_log` table with actor, entity, and metadata. Useful for compliance and for tracking down "who changed this?" questions.
- **Swagger API docs** at `/api/docs` — makes it easy for anyone (including your future integrators) to see the full API surface.
- **Seed script** now also creates 5 published NOM courses (009, 017, 002, 019, 036) so a fresh install has a working catalog immediately.

**Frontend polish**
- Support widget accessible from every dashboard page.
- Recertification & certificate revocation flows use branded confirmation dialogs (no more browser `confirm()` popups).
- Consulting and Software marketing pages built (placeholder copy — happy to swap once you send real text).
- **Audit log viewer** for Principal Admin at `/dashboard/principal-admin/audit` — search, filter, expand any entry to see the full JSON metadata.

## What's still blocking us

These need a decision from your side before we can complete them properly:

| Priority | Item | What we need |
| --- | --- | --- |
| HIGH | Payment gateway | Stripe / Mercado Pago / Conekta — pick one and share test API keys |
| HIGH | CFDI e-invoice provider | Facturama / SW Sapien / Solcedi — needed for SAT-compliant invoices |
| HIGH | DC-3 format details | Folio numbering scheme, agent seal image, signatures |
| HIGH | Real NOM course content | Videos, materials, quiz question banks per course |
| HIGH | Hosting | AWS / DigitalOcean / Vercel+Railway — our deploy guide is provider-agnostic |
| MED  | Pricing model | Per-seat / per-course / subscription (affects the Team page "seats available" UI) |
| MED  | Legal texts | Terms, Privacy, Aviso de Privacidad from your legal team |
| MED  | Live chat tool | Intercom / Crisp / Tawk — slot is ready in the layout |
| MED  | Brand assets | Logo files, brand colors beyond primary blue |
| MED  | Domain + SSL | Domain choice; Caddy will handle TLS automatically |

## Next up on our side

While we wait, we're planning to:

1. End-to-end browser testing across all 5 roles to catch UI regressions from the last few weeks of changes.
2. Multi-tenant hardening review — audit every service method to make sure company/user scoping is airtight.

Anything else you'd like us to prioritize, or answers to any of the blockers above, would let us keep momentum.

Thanks!
Munas
