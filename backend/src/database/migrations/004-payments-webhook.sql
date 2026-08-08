-- 004-payments-webhook.sql
-- Payment webhook events log and payments columns.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_ref   TEXT,
  event_id       TEXT,
  payload_json   JSONB NOT NULL,
  signature      TEXT,
  verified       BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pwe_provider_ref ON payment_webhook_events(provider_ref);
CREATE INDEX IF NOT EXISTS idx_pwe_event_id ON payment_webhook_events(event_id);
