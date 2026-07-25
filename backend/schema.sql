-- pages table
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief JSONB NOT NULL,
    brand_kit JSONB,
    sections JSONB NOT NULL,
    meta JSONB NOT NULL,
    flags JSONB,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- page_versions table
CREATE TABLE IF NOT EXISTS page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    state JSONB NOT NULL,
    html TEXT NOT NULL,
    label TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pages_created_by ON pages(created_by);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
