# PixelPage Phase 1 & 2 — AI Landing Page Audit & Regeneration SaaS

PixelPage helps founders and marketers find conversion issues on their landing pages and generate optimized page versions using AI.

## Core Features
- **Minimal Homepage**: URL analysis input & conversion breakdown teaser.
- **Supabase Authentication**: Email/Password and Google OAuth support.
- **Server-Enforced Free Audit Limit**: 1 lifetime free audit per user.
- **Firecrawl Page Scraper & Screenshot Capture**: Secure structured extraction of headlines, CTAs, copy, and visual screenshots with SSRF protection.
- **Kimi AI CRO & Multimodal Vision Engine**: Expert CRO evaluation across 14 dimensions and visual design hierarchy.
- **CRO Audit Report Page**: Overall score, category progress bars, and top 5 priority recommendations with current vs. suggested copy replacements.
- **Landing Page Regeneration Engine (Phase 2)**: Section-by-section optimization with `kimi-k2.7-code`, customizable brand rules (tone, color, CTA style, banned words), side-by-side section diffs, and downloadable HTML export.

---

## 1. Prerequisites & Environment Variables

Copy `frontend/.env.example` to `frontend/.env.local` and configure your API keys:

```env
KIMI_API_KEY=your-kimi-api-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

---

## 2. Supabase Setup

Run the SQL script located in `supabase/schema.sql` inside your Supabase SQL Editor.

This will:
1. Create the `profiles` table tracking `free_audit_used`.
2. Create the `audits` table storing full CRO audit JSON.
3. Create the `regenerations` table storing landing page section diffs and compiled HTML exports.
4. Enable Row Level Security (RLS) policies.
5. Create an automated Auth trigger (`on_auth_user_created`) to create a profile row upon user registration.

---

## 3. Local Development

Navigate to the `frontend` folder and run the development server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 4. Building & Deployment (Vercel)

To verify the production build locally:

```bash
cd frontend
npm run build
```

Deploying to Vercel:
1. Connect your repository to Vercel.
2. Set the Root Directory to `frontend`.
3. Add the environment variables (`KIMI_API_KEY`, `FIRECRAWL_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy!
