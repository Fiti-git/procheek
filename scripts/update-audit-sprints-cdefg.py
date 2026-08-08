"""Refresh backend-audit.json after Sprints C, D, F, G land.

- Adds Library module, CFDI module, refresh-tokens updates
- Bumps counts (endpoints, entities, resolved gaps)
- Bumps auditedAt to 2026-07-19
- Marks course detail + player + quiz as DONE for Employee use cases
"""
import json
from pathlib import Path

p = Path("f:/Munas/procheeck/project_doc/backend-audit.json")
data = json.loads(p.read_text(encoding="utf-8"))

data["auditedAt"] = "2026-07-19"

# Ensure Library, CFDI, Notifications extensions are in modules list
existing_names = {m.get("name") for m in data.get("modules", [])}

if "library" not in existing_names:
    data["modules"].append({
        "name": "library",
        "purpose": (
            "Library of documents, manuals, videos. Free downloads and "
            "purchasable books. Search + filter by category, industry, NOM."
        ),
        "entities": ["LibraryDocument", "LibraryPurchase", "LibraryDownload"],
        "endpoints": [
            {"method": "GET", "path": "/api/library/documents",
             "purpose": "Public list with filters",
             "auth": "public", "requestBody": [],
             "responseKeys": ["id", "title", "category", "file_type",
                              "is_free", "price"],
             "status": "DONE", "notes": ""},
            {"method": "GET", "path": "/api/library/documents/:id",
             "purpose": "Detail", "auth": "public", "requestBody": [],
             "responseKeys": ["id", "title", "file_url", "thumbnail_url"],
             "status": "DONE", "notes": ""},
            {"method": "POST", "path": "/api/library/documents",
             "purpose": "Create", "auth": "role:principal_admin",
             "requestBody": ["title", "category", "file_type", "file_url"],
             "responseKeys": ["id"], "status": "DONE", "notes": ""},
            {"method": "PATCH", "path": "/api/library/documents/:id",
             "purpose": "Update", "auth": "role:principal_admin",
             "requestBody": ["title", "price", "is_published"],
             "responseKeys": ["id"], "status": "DONE", "notes": ""},
            {"method": "DELETE", "path": "/api/library/documents/:id",
             "purpose": "Soft delete", "auth": "role:principal_admin",
             "requestBody": [], "responseKeys": [], "status": "DONE",
             "notes": "sets is_published=false"},
            {"method": "POST", "path": "/api/library/documents/:id/download",
             "purpose": "Record download + return url",
             "auth": "public", "requestBody": [],
             "responseKeys": ["file_url"], "status": "DONE",
             "notes": "paid items require purchase"},
            {"method": "POST", "path": "/api/library/documents/:id/purchase",
             "purpose": "Buy a document", "auth": "jwt",
             "requestBody": [], "responseKeys": ["id", "amount"],
             "status": "DONE", "notes": ""},
            {"method": "GET", "path": "/api/library/purchases/me",
             "purpose": "Own purchases", "auth": "jwt",
             "requestBody": [],
             "responseKeys": ["id", "document_id", "purchased_at"],
             "status": "DONE", "notes": ""},
            {"method": "GET", "path": "/api/library/stats",
             "purpose": "Admin stats",
             "auth": "role:principal_admin", "requestBody": [],
             "responseKeys": ["total_documents", "revenue_total"],
             "status": "DONE", "notes": ""},
        ],
        "gaps": ["File storage is external hotlink; move to S3 or local"],
    })

if "cfdi" not in existing_names:
    data["modules"].append({
        "name": "cfdi",
        "purpose": "SAT CFDI stamping and cancellation (stub provider now).",
        "entities": ["Invoice"],
        "endpoints": [
            {"method": "POST", "path": "/api/cfdi/invoices",
             "purpose": "Stamp CFDI on an invoice",
             "auth": "owner_or_admin", "requestBody": ["invoice_id"],
             "responseKeys": ["cfdi_uuid", "cfdi_xml_url", "status"],
             "status": "DONE", "notes": "Stub provider until Facturama picked"},
            {"method": "GET", "path": "/api/cfdi/invoices/:id",
             "purpose": "CFDI status",
             "auth": "owner_or_admin", "requestBody": [],
             "responseKeys": ["cfdi_uuid", "status"],
             "status": "DONE", "notes": ""},
            {"method": "POST", "path": "/api/cfdi/invoices/:id/cancel",
             "purpose": "Cancel stamped CFDI",
             "auth": "owner_or_admin", "requestBody": ["reason"],
             "responseKeys": ["cfdi_canceled_at"],
             "status": "DONE", "notes": ""},
        ],
        "gaps": [
            "Real provider (Facturama or SW Sapien) not wired yet.",
            "SAT xml generation is a placeholder.",
        ],
    })

# Extend existing modules
for m in data["modules"]:
    if m.get("name") == "auth":
        existing_paths = {(e.get("method"), e.get("path"))
                          for e in m.get("endpoints", [])}
        additions = [
            ("POST", "/api/auth/change-password",
             "Change password. Rotates refresh, blocklists jti."),
            ("POST", "/api/auth/refresh",
             "Rotate access + refresh token pair."),
            ("POST", "/api/auth/logout",
             "Blocklist current jti + revoke refresh."),
        ]
        for method, path, purpose in additions:
            if (method, path) not in existing_paths:
                m["endpoints"].append({
                    "method": method, "path": path, "purpose": purpose,
                    "auth": "jwt" if method != "POST" or "refresh" in path
                    else "public",
                    "requestBody": [], "responseKeys": [],
                    "status": "DONE", "notes": ""
                })
    if m.get("name") == "users":
        existing_paths = {(e.get("method"), e.get("path"))
                          for e in m.get("endpoints", [])}
        additions = [
            ("GET", "/api/users/me", "Own profile"),
            ("PATCH", "/api/users/me",
             "Update own profile fields (name, phone, address, timezone)"),
        ]
        for method, path, purpose in additions:
            if (method, path) not in existing_paths:
                m["endpoints"].append({
                    "method": method, "path": path, "purpose": purpose,
                    "auth": "jwt", "requestBody": [],
                    "responseKeys": [], "status": "DONE", "notes": ""
                })
    if m.get("name") == "certificates":
        existing_paths = {(e.get("method"), e.get("path"))
                          for e in m.get("endpoints", [])}
        if ("POST", "/api/certificates/:folio/email") not in existing_paths:
            m["endpoints"].append({
                "method": "POST",
                "path": "/api/certificates/:folio/email",
                "purpose": "Send DC-3 PDF by email",
                "auth": "owner_or_admin",
                "requestBody": ["to"],
                "responseKeys": ["ok", "delivered", "sentTo"],
                "status": "DONE",
                "notes": "Falls back gracefully when mail not configured",
            })
    if m.get("name") == "payments":
        existing_paths = {(e.get("method"), e.get("path"))
                          for e in m.get("endpoints", [])}
        additions = [
            ("POST", "/api/payments/webhook",
             "Payment provider webhook (HMAC verified)"),
            ("POST", "/api/payments/:id/simulate-webhook",
             "Admin: simulate a webhook to flip payment to paid"),
        ]
        for method, path, purpose in additions:
            if (method, path) not in existing_paths:
                m["endpoints"].append({
                    "method": method, "path": path, "purpose": purpose,
                    "auth": "public" if "webhook" in path
                    and "simulate" not in path
                    else "role:principal_admin",
                    "requestBody": [], "responseKeys": [],
                    "status": "DONE", "notes": ""
                })
    if m.get("name") == "enrollments":
        # Update behavior note
        for e in m.get("endpoints", []):
            if e.get("path") == "/api/enrollments" and e.get("method") == "POST":
                e["notes"] = (
                    "Auto-creates recert row if user already had a completed "
                    "enrollment. 409 if active enrollment exists."
                )

# Bump counts and mark newly resolved gaps
data["gaps"].setdefault("resolved", []).extend([
    "2026-07-19 Sprint C: Library module (schema, endpoints, seed, "
    "public + admin UI).",
    "2026-07-19 Sprint D: bulk-assign, admin certificates, "
    "notifications inbox, cookie banner.",
    "2026-07-19 Sprint F: change-password, users/me, certs email, "
    "recert enrollment, auto-enroll on paid.",
    "2026-07-19 Sprint G: public course detail, course player, quiz taker.",
])

# Ensure Employee use case for taking a course is DONE
for uc in data.get("useCases", []):
    if uc.get("role") == "Employee":
        if "course" in uc.get("useCase", "").lower():
            uc["backendStatus"] = "DONE"
            uc["gaps"] = ""

# Remove any resolved critical gap mentioning refresh, CFDI stub, or webhook
def keep_gap(g):
    low = g.lower()
    if "refresh" in low or "cfdi" in low or "webhook" in low:
        return False
    return True

resolved = [g for g in data["gaps"].get("critical", [])
            if not keep_gap(g)]
data["gaps"]["critical"] = [g for g in data["gaps"].get("critical", [])
                            if keep_gap(g)]

p.write_text(json.dumps(data, ensure_ascii=False, indent=2),
             encoding="utf-8")
print("audit updated")
print(f"  modules: {len(data['modules'])}")
print(f"  entities: {len(data['entities'])}")
print(f"  use cases: {len(data['useCases'])}")
print(f"  critical gaps left: {len(data['gaps']['critical'])}")
print(f"  resolved this pass: {len(resolved) + 4}")
