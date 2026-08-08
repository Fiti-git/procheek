-- PROCHEECK initial schema
-- Postgres 14+

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Roles (seed table)
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  code          TEXT PRIMARY KEY,
  label_es      TEXT NOT NULL,
  label_en      TEXT NOT NULL
);

INSERT INTO roles (code, label_es, label_en) VALUES
  ('principal_admin', 'Administrador principal', 'Principal Admin'),
  ('client',          'Cliente',                 'Client'),
  ('client_admin',    'Administrador del cliente', 'Client Admin'),
  ('subcontractor',   'Subcontratista',          'Subcontractor'),
  ('employee',        'Empleado',                'Employee')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- Companies (clients and subcontractors)
-- A subcontractor company links to its parent client via parent_company_id.
-- ============================================================
CREATE TYPE company_type AS ENUM ('client', 'subcontractor');

CREATE TABLE IF NOT EXISTS companies (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name         TEXT NOT NULL,
  rfc                TEXT UNIQUE,                 -- Mexican tax ID
  type               company_type NOT NULL,
  parent_company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  contact_email      TEXT,
  contact_phone      TEXT,
  address            TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sub_requires_parent
    CHECK (type = 'client' OR parent_company_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_companies_parent ON companies(parent_company_id);

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  role_code      TEXT NOT NULL REFERENCES roles(code),
  company_id     UUID REFERENCES companies(id) ON DELETE SET NULL,
  curp           TEXT,                            -- Mexican personal ID (for DC-3)
  locale         TEXT NOT NULL DEFAULT 'es',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_code);

-- ============================================================
-- Courses & modules
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT UNIQUE NOT NULL,
  title_es       TEXT NOT NULL,
  title_en       TEXT,
  description_es TEXT,
  description_en TEXT,
  nom_reference  TEXT,                            -- e.g. "NOM-009-STPS-2011"
  price_mxn      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_hours NUMERIC(5, 2),
  is_published   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_modules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position     INT NOT NULL,
  title_es     TEXT NOT NULL,
  title_en     TEXT,
  content_url  TEXT,                              -- video / SCORM / doc
  duration_min INT,
  UNIQUE (course_id, position)
);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);

-- ============================================================
-- Quizzes
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_es       TEXT NOT NULL,
  title_en       TEXT,
  passing_score  INT NOT NULL DEFAULT 80,         -- percent
  max_attempts   INT NOT NULL DEFAULT 3,
  questions      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score        INT NOT NULL,                      -- percent
  passed       BOOLEAN NOT NULL,
  answers      JSONB,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON quiz_attempts(quiz_id);

-- ============================================================
-- Enrollments
-- ============================================================
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'failed', 'expired', 'cancelled');

CREATE TABLE IF NOT EXISTS enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,  -- payer
  status        enrollment_status NOT NULL DEFAULT 'active',
  progress_pct  INT NOT NULL DEFAULT 0,
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_company ON enrollments(company_id);

-- ============================================================
-- Certificates (DC-3 style)
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id      UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  code           TEXT UNIQUE NOT NULL,            -- public lookup code
  issued_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ,
  pdf_url        TEXT,
  dc3_folio      TEXT,                            -- STPS folio number
  revoked_at     TIMESTAMPTZ,
  revoked_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(code);

-- ============================================================
-- Payments & invoices
-- ============================================================
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  amount_mxn     NUMERIC(10, 2) NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'MXN',
  status         payment_status NOT NULL DEFAULT 'pending',
  provider       TEXT,                            -- stripe / mercadopago / etc.
  provider_ref   TEXT,
  items          JSONB NOT NULL DEFAULT '[]'::jsonb, -- line items (course_id, qty, price)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

CREATE TABLE IF NOT EXISTS invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id    UUID NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  number        TEXT UNIQUE NOT NULL,
  cfdi_uuid     TEXT,                             -- Mexican CFDI (SAT) UUID
  cfdi_xml_url  TEXT,
  pdf_url       TEXT,
  subtotal_mxn  NUMERIC(10, 2) NOT NULL,
  tax_mxn       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_mxn     NUMERIC(10, 2) NOT NULL,
  issued_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_email  TEXT,
  actor_role   TEXT,
  action       TEXT NOT NULL,
  entity_type  TEXT,
  entity_id    UUID,
  metadata     JSONB,
  ip           TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
