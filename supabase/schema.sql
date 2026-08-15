-- ==========================================
-- PixelPage Phase 1 & 2 - Supabase Schema
-- ==========================================

-- 1. Clean slate: Drop existing tables & triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP TABLE IF EXISTS public.regenerations CASCADE;
DROP TABLE IF EXISTS public.audits CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    free_audit_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Create Audits Table
CREATE TABLE public.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    summary TEXT NOT NULL,
    page_data_json JSONB NOT NULL,
    audit_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Create Regenerations Table (Phase 2)
CREATE TABLE public.regenerations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    suggestion_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    brand_config_json JSONB DEFAULT '{}'::jsonb,
    sections_json JSONB NOT NULL,
    full_regenerated_html TEXT NOT NULL,
    token_usage_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regenerations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 7. RLS Policies for Audits
CREATE POLICY "Users can view their own audits"
    ON public.audits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audits"
    ON public.audits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 8. RLS Policies for Regenerations
CREATE POLICY "Users can view their own regenerations"
    ON public.regenerations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own regenerations"
    ON public.regenerations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 9. Trigger to automatically create profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, free_audit_used)
    VALUES (new.id, COALESCE(new.email, ''), FALSE)
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
