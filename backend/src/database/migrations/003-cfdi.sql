-- 003-cfdi.sql
-- CFDI columns for invoices table. Additive only.

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS stamped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cfdi_canceled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cfdi_reason TEXT,
  ADD COLUMN IF NOT EXISTS cfdi_status TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_cfdi_uuid ON invoices(cfdi_uuid);
