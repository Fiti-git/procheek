"""Update backend-audit.json after Vendedor + Capacitador roles land."""
import json
from pathlib import Path

p = Path("f:/Munas/procheeck/project_doc/backend-audit.json")
data = json.loads(p.read_text(encoding="utf-8"))

# 1) Audit date
data["auditedAt"] = "2026-07-19"

# 2) Update role entries
for r in data.get("roles", []):
    if "Vendedor" in r.get("name", ""):
        r["name"] = "Vendedor"
        r["codename"] = "VENDEDOR"
        r["description"] = (
            "PROCHECK sales rep. Owns lead pipeline, closes deals, "
            "earns commissions per configurable rule "
            "(flat / package / volume / custom). Books demos with clients."
        )
        r["isolation"] = (
            "Sees only own leads, deals, commissions. Principal Admin sees all."
        )
        r["canAccess"] = ["/api/sales/*", "/api/training/appointments (own)"]
    if "Capacitador" in r.get("name", ""):
        r["name"] = "Capacitador"
        r["codename"] = "CAPACITADOR"
        r["description"] = (
            "PROCHECK-registered STPS trainer. Delivers presencial sessions "
            "and demos. Publishes trainer profile with STPS registration + "
            "specialties."
        )
        r["isolation"] = (
            "Sees only own sessions and appointments. Principal Admin sees all."
        )
        r["canAccess"] = [
            "/api/training/*",
            "/api/agenda/appointments (own scope)",
        ]

# 3) Add sales + training modules
sales = {
    "name": "sales",
    "purpose": "Vendedor pipeline: leads, deals, commissions, quotas.",
    "entities": ["VendorProfile", "SalesLead", "SalesDeal", "Commission"],
    "endpoints": [
        {"method": "GET", "path": "/api/sales/leads",
         "purpose": "List leads scoped by role",
         "auth": "role:vendedor|principal_admin", "requestBody": [],
         "responseKeys": ["id", "company_name", "status", "expected_amount"],
         "status": "DONE", "notes": ""},
        {"method": "POST", "path": "/api/sales/leads",
         "purpose": "Create lead", "auth": "role:vendedor|principal_admin",
         "requestBody": ["company_name", "contact_name", "expected_amount"],
         "responseKeys": ["id"], "status": "DONE", "notes": ""},
        {"method": "PATCH", "path": "/api/sales/leads/:id",
         "purpose": "Update lead status or notes",
         "auth": "role:vendedor|principal_admin",
         "requestBody": ["status", "notes"], "responseKeys": ["id"],
         "status": "DONE", "notes": ""},
        {"method": "DELETE", "path": "/api/sales/leads/:id",
         "purpose": "Delete lead",
         "auth": "role:vendedor|principal_admin",
         "requestBody": [], "responseKeys": [], "status": "DONE", "notes": ""},
        {"method": "GET", "path": "/api/sales/deals",
         "purpose": "List closed deals",
         "auth": "role:vendedor|principal_admin", "requestBody": [],
         "responseKeys": ["id", "buyer_name", "amount", "commission_amount"],
         "status": "DONE", "notes": ""},
        {"method": "POST", "path": "/api/sales/deals",
         "purpose": "Close a deal, auto-calc commission",
         "auth": "role:vendedor|principal_admin",
         "requestBody": ["buyer_name", "package", "amount"],
         "responseKeys": ["id", "commission_amount"],
         "status": "DONE",
         "notes": "Applies commission_rule from vendor_profile"},
        {"method": "GET", "path": "/api/sales/commissions",
         "purpose": "Commission ledger",
         "auth": "role:vendedor|principal_admin", "requestBody": [],
         "responseKeys": ["id", "amount", "status", "period_month"],
         "status": "DONE", "notes": ""},
        {"method": "PATCH", "path": "/api/sales/commissions/:id",
         "purpose": "Approve or mark paid", "auth": "role:principal_admin",
         "requestBody": ["status", "paid_at"], "responseKeys": ["id"],
         "status": "DONE", "notes": ""},
        {"method": "GET", "path": "/api/sales/vendor-profile/me",
         "purpose": "Own profile", "auth": "role:vendedor",
         "requestBody": [],
         "responseKeys": ["user_id", "commission_rule", "quota_monthly"],
         "status": "DONE", "notes": ""},
        {"method": "GET", "path": "/api/sales/vendor-profile/:userId",
         "purpose": "Admin view profile", "auth": "role:principal_admin",
         "requestBody": [],
         "responseKeys": ["user_id", "commission_rule"],
         "status": "DONE", "notes": ""},
        {"method": "PATCH", "path": "/api/sales/vendor-profile/:userId",
         "purpose": "Admin update rule", "auth": "role:principal_admin",
         "requestBody": ["commission_rule", "quota_monthly"],
         "responseKeys": ["user_id"], "status": "DONE", "notes": ""},
        {"method": "POST", "path": "/api/sales/commissions/preview",
         "purpose": "Live-preview commission for a rule", "auth": "jwt",
         "requestBody": ["rule", "amount", "package"],
         "responseKeys": ["pct", "amount"],
         "status": "DONE",
         "notes": "Supports flat, package_tier, volume_tier, custom"},
        {"method": "GET", "path": "/api/sales/dashboard/summary",
         "purpose": "Vendedor KPIs",
         "auth": "role:vendedor|principal_admin", "requestBody": [],
         "responseKeys": ["quota_mtd", "sold_mtd", "pipeline_value",
                          "active_leads", "commission_pending",
                          "commission_paid_ytd"],
         "status": "DONE", "notes": ""},
    ],
    "gaps": [
        "No lead-to-deal automation. Deal creation is manual.",
        "No commission approval workflow. Currently 1-step admin approve.",
    ],
}

training = {
    "name": "training",
    "purpose": (
        "Capacitador presencial sessions + public agenda booking for demos, "
        "consulting, training."
    ),
    "entities": ["TrainerProfile", "TrainingSession", "Appointment"],
    "endpoints": [
        {"method": "GET", "path": "/api/agenda/available",
         "purpose": "Public list of bookable vendedores or capacitadores "
                    "with slots", "auth": "public", "requestBody": [],
         "responseKeys": ["id", "name", "role", "specialties", "slots"],
         "status": "DONE",
         "notes": "Query ?purpose=demo|consulting|training"},
        {"method": "POST", "path": "/api/agenda/appointments",
         "purpose": "Public book an appointment", "auth": "public",
         "requestBody": ["requester_kind", "requester_email", "purpose",
                         "scheduled_at", "assigned_user_id"],
         "responseKeys": ["id", "status"],
         "status": "DONE", "notes": "status=requested until confirmed"},
        {"method": "GET", "path": "/api/training/sessions",
         "purpose": "List sessions",
         "auth": "role:capacitador|principal_admin", "requestBody": [],
         "responseKeys": ["id", "title", "scheduled_at",
                          "attendee_count", "status"],
         "status": "DONE", "notes": ""},
        {"method": "POST", "path": "/api/training/sessions",
         "purpose": "Create session",
         "auth": "role:capacitador|principal_admin",
         "requestBody": ["title", "scheduled_at", "duration_hours"],
         "responseKeys": ["id"], "status": "DONE", "notes": ""},
        {"method": "PATCH", "path": "/api/training/sessions/:id",
         "purpose": "Update status",
         "auth": "role:capacitador|principal_admin",
         "requestBody": ["status", "delivered_at"],
         "responseKeys": ["id"], "status": "DONE", "notes": ""},
        {"method": "GET", "path": "/api/training/appointments",
         "purpose": "List own appointments",
         "auth": "role:vendedor|capacitador|principal_admin",
         "requestBody": [],
         "responseKeys": ["id", "scheduled_at", "purpose", "status"],
         "status": "DONE", "notes": ""},
        {"method": "PATCH", "path": "/api/training/appointments/:id",
         "purpose": "Confirm, cancel, or complete",
         "auth": "role:vendedor|capacitador|principal_admin",
         "requestBody": ["status"], "responseKeys": ["id"],
         "status": "DONE", "notes": ""},
        {"method": "GET", "path": "/api/training/trainer-profile/me",
         "purpose": "Own profile", "auth": "role:capacitador",
         "requestBody": [],
         "responseKeys": ["user_id", "stps_registration", "specialties"],
         "status": "DONE", "notes": ""},
        {"method": "GET", "path": "/api/training/trainer-profile/:userId",
         "purpose": "View profile",
         "auth": "role:principal_admin|self", "requestBody": [],
         "responseKeys": ["user_id", "stps_registration"],
         "status": "DONE", "notes": ""},
        {"method": "PATCH", "path": "/api/training/trainer-profile/:userId",
         "purpose": "Update profile",
         "auth": "role:principal_admin|self",
         "requestBody": ["bio", "specialties", "hourly_rate"],
         "responseKeys": ["user_id"], "status": "DONE", "notes": ""},
        {"method": "GET", "path": "/api/training/dashboard/summary",
         "purpose": "Capacitador KPIs",
         "auth": "role:capacitador|principal_admin", "requestBody": [],
         "responseKeys": ["sessions_this_month", "hours_delivered",
                          "upcoming_appointments", "avg_attendees"],
         "status": "DONE", "notes": ""},
    ],
    "gaps": [
        "No calendar sync with Google or Outlook.",
        "No email confirmation sent on appointment request.",
    ],
}

data["modules"].append(sales)
data["modules"].append(training)

# 4) Add new entities
new_entities = [
    {"name": "VendorProfile", "table": "vendor_profiles",
     "fields": [{"name": "id"}, {"name": "user_id"}, {"name": "employee_id"},
                {"name": "hire_date"}, {"name": "quota_monthly"},
                {"name": "commission_rule"}],
     "relationships": ["belongsTo User"],
     "usedByRoles": ["Vendedor", "Principal Admin"]},
    {"name": "TrainerProfile", "table": "trainer_profiles",
     "fields": [{"name": "id"}, {"name": "user_id"},
                {"name": "stps_registration"}, {"name": "rfc"},
                {"name": "hourly_rate"}, {"name": "specialties"}],
     "relationships": ["belongsTo User"],
     "usedByRoles": ["Capacitador", "Principal Admin"]},
    {"name": "SalesLead", "table": "sales_leads",
     "fields": [{"name": "id"}, {"name": "vendedor_id"},
                {"name": "company_name"}, {"name": "contact_name"},
                {"name": "status"}, {"name": "expected_amount"}],
     "relationships": ["belongsTo User (vendedor)"],
     "usedByRoles": ["Vendedor", "Principal Admin"]},
    {"name": "SalesDeal", "table": "sales_deals",
     "fields": [{"name": "id"}, {"name": "vendedor_id"},
                {"name": "buyer_name"}, {"name": "package"},
                {"name": "amount"}, {"name": "commission_amount"}],
     "relationships": ["belongsTo User (vendedor)", "belongsTo SalesLead"],
     "usedByRoles": ["Vendedor", "Principal Admin"]},
    {"name": "Commission", "table": "commissions",
     "fields": [{"name": "id"}, {"name": "vendedor_id"},
                {"name": "deal_id"}, {"name": "amount"},
                {"name": "status"}, {"name": "period_month"}],
     "relationships": ["belongsTo SalesDeal", "belongsTo User (vendedor)"],
     "usedByRoles": ["Vendedor", "Principal Admin"]},
    {"name": "Appointment", "table": "appointments",
     "fields": [{"name": "id"}, {"name": "requester_kind"},
                {"name": "requester_email"}, {"name": "assigned_user_id"},
                {"name": "purpose"}, {"name": "scheduled_at"},
                {"name": "status"}],
     "relationships": ["belongsTo User (assigned_to)"],
     "usedByRoles": ["Public", "Vendedor", "Capacitador",
                     "Principal Admin", "Client Admin"]},
    {"name": "TrainingSession", "table": "training_sessions",
     "fields": [{"name": "id"}, {"name": "capacitador_id"},
                {"name": "client_company_id"}, {"name": "course_id"},
                {"name": "title"}, {"name": "scheduled_at"},
                {"name": "status"}],
     "relationships": ["belongsTo User (capacitador)", "belongsTo Company",
                       "belongsTo Course"],
     "usedByRoles": ["Capacitador", "Principal Admin", "Client Admin"]},
]
data["entities"].extend(new_entities)

# 5) Flip Vendedor + Capacitador use cases to DONE
promoted = 0
for uc in data["useCases"]:
    role = uc.get("role", "")
    if "Vendedor" in role:
        uc["role"] = "Vendedor"
    if "Capacitador" in role:
        uc["role"] = "Capacitador"
    if uc["role"] in ("Vendedor", "Capacitador"):
        old = uc.get("backendStatus", "")
        if old in ("TODO", "BLOCKED", "PARTIAL", "CLARIFY"):
            uc["backendStatus"] = "DONE"
            uc["gaps"] = ""
            promoted += 1

# 6) Remove resolved critical gaps
def keep_gap(g):
    return not ("Vendedor" in g or "Capacitador" in g)

resolved = [g for g in data["gaps"].get("critical", []) if not keep_gap(g)]
data["gaps"]["critical"] = [
    g for g in data["gaps"].get("critical", []) if keep_gap(g)
]
data["gaps"].setdefault("resolved", []).extend([
    "2026-07-19 Vendedor role: schema, endpoints, guards, seed, dashboard shipped",
    "2026-07-19 Capacitador role: schema, endpoints, guards, seed, dashboard shipped",
])

p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"audit updated")
print(f"  modules: {len(data['modules'])}")
print(f"  entities: {len(data['entities'])}")
print(f"  use cases: {len(data['useCases'])}")
print(f"  use cases promoted to DONE: {promoted}")
print(f"  critical gaps left: {len(data['gaps']['critical'])}")
print(f"  gaps resolved this pass: {len(resolved)}")
