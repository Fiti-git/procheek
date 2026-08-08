-- Extend companies table for the Companies module.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS city       TEXT,
  ADD COLUMN IF NOT EXISTS state      TEXT,
  ADD COLUMN IF NOT EXISTS zip        TEXT,
  ADD COLUMN IF NOT EXISTS industry   TEXT,
  ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_companies_type   ON companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
