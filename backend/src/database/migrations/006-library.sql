-- Migration 006: Library module (documents, purchases, downloads).
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS library_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general','nom_009','nom_017','nom_002','nom_019','nom_036','other')),
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  thumbnail_url TEXT,
  nom_reference TEXT,
  industry TEXT,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  price NUMERIC(10,2),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_documents_category ON library_documents(category);
CREATE INDEX IF NOT EXISTS idx_library_documents_industry ON library_documents(industry);
CREATE INDEX IF NOT EXISTS idx_library_documents_is_published ON library_documents(is_published);
CREATE INDEX IF NOT EXISTS idx_library_documents_created_by ON library_documents(created_by);

CREATE TABLE IF NOT EXISTS library_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  document_id UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_id UUID REFERENCES payments(id),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_library_purchases_user_id ON library_purchases(user_id);

CREATE TABLE IF NOT EXISTS library_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  document_id UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_library_downloads_user_id ON library_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_library_downloads_document_id ON library_downloads(document_id);
