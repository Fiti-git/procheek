-- Vendedor (Seller) and Capacitador (Trainer) roles migration.

-- ============================================================
-- Roles
-- ============================================================
INSERT INTO roles (code, label_es, label_en) VALUES
  ('vendedor',    'Vendedor',    'Seller'),
  ('capacitador', 'Capacitador', 'Trainer')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- vendor_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_id      TEXT,
  hire_date        DATE,
  quota_monthly    NUMERIC(12, 2) DEFAULT 0,
  commission_rule  JSONB NOT NULL DEFAULT '{"type":"flat","flat_pct":10}'::jsonb,
  bio              TEXT,
  specialties      TEXT[] DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_active ON vendor_profiles(is_active);

-- ============================================================
-- trainer_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS trainer_profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stps_registration  TEXT,
  rfc                TEXT,
  hourly_rate        NUMERIC(12, 2),
  bio                TEXT,
  specialties        TEXT[] DEFAULT '{}',
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trainer_profiles_active ON trainer_profiles(is_active);

-- ============================================================
-- sales_leads
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  company_name      TEXT NOT NULL,
  contact_name      TEXT NOT NULL,
  contact_email     TEXT,
  contact_phone     TEXT,
  industry          TEXT,
  expected_amount   NUMERIC(12, 2),
  status            TEXT NOT NULL DEFAULT 'nuevo'
                    CHECK (status IN ('nuevo','contactado','propuesta','cerrado_ganado','cerrado_perdido')),
  notes             TEXT,
  closed_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_leads_vendedor ON sales_leads(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_sales_leads_status   ON sales_leads(status);

-- ============================================================
-- sales_deals
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_deals (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id               UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  lead_id                   UUID REFERENCES sales_leads(id) ON DELETE SET NULL,
  buyer_company_id          UUID REFERENCES companies(id) ON DELETE SET NULL,
  buyer_name                TEXT NOT NULL,
  package                   TEXT NOT NULL CHECK (package IN ('basico','plus','enterprise','custom')),
  amount                    NUMERIC(12, 2) NOT NULL,
  commission_pct            NUMERIC(5, 2) NOT NULL,
  commission_amount         NUMERIC(12, 2) NOT NULL,
  commission_rule_snapshot  JSONB NOT NULL,
  closed_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_deals_vendedor ON sales_deals(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_sales_deals_lead     ON sales_deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_deals_buyer    ON sales_deals(buyer_company_id);

-- ============================================================
-- commissions
-- ============================================================
CREATE TABLE IF NOT EXISTS commissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  deal_id       UUID NOT NULL REFERENCES sales_deals(id) ON DELETE CASCADE,
  amount        NUMERIC(12, 2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','paid','void')),
  period_month  DATE NOT NULL,
  paid_at       TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_commissions_vendedor ON commissions(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_deal     ON commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status   ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_period   ON commissions(period_month);

-- ============================================================
-- appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_kind           TEXT NOT NULL
                           CHECK (requester_kind IN ('public','client_admin','client','subcontractor')),
  requester_user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_company_name   TEXT,
  requester_contact_name   TEXT NOT NULL,
  requester_email          TEXT NOT NULL,
  requester_phone          TEXT,
  assigned_user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_role            TEXT NOT NULL CHECK (assigned_role IN ('vendedor','capacitador')),
  purpose                  TEXT NOT NULL CHECK (purpose IN ('demo','consulting','training','follow_up')),
  scheduled_at             TIMESTAMPTZ NOT NULL,
  duration_min             INTEGER NOT NULL DEFAULT 30,
  status                   TEXT NOT NULL DEFAULT 'requested'
                           CHECK (status IN ('requested','confirmed','completed','canceled','no_show')),
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_appointments_assigned  ON appointments(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_requester ON appointments(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status    ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);

-- ============================================================
-- training_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capacitador_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  client_company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  course_id          UUID REFERENCES courses(id) ON DELETE SET NULL,
  title              TEXT NOT NULL,
  scheduled_at       TIMESTAMPTZ NOT NULL,
  delivered_at       TIMESTAMPTZ,
  duration_hours     NUMERIC(4, 2),
  attendee_count     INTEGER DEFAULT 0,
  location           TEXT,
  status             TEXT NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled','delivered','canceled')),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_training_sessions_cap    ON training_sessions(capacitador_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_client ON training_sessions(client_company_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_course ON training_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
