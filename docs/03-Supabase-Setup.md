# Supabase setup for PlantTrack AI

Project: `eszdfuovomkdeomttdta`
Region: `ap-southeast-1`

## Already completed
- Initial PostgreSQL schema migration applied.
- Row Level Security enabled on all application tables.
- Helper functions restricted to authenticated users.
- Vercel project has `SUPABASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` configured for production, preview, and development.

## Required server-only key
The API in `api/_lib/server.ts` uses an elevated server-side Supabase key to verify sessions and perform scoped operations. This key must never be exposed to the browser, committed to Git, or pasted into chat.

1. Open Supabase Dashboard > Project Settings > API Keys.
2. Create/copy a **Secret key** (preferred, starts with `sb_secret_`) or the legacy `service_role` key.
3. Open Vercel > project `planttrack-ai-absen` > Settings > Environment Variables.
4. Add `SUPABASE_SECRET_KEY` with that value. Choose Production, Preview, and Development.
5. Save, then redeploy the project.

The server accepts `SUPABASE_SECRET_KEY` or the legacy `SUPABASE_SERVICE_ROLE_KEY`. Never use either key in a `VITE_` variable.

## Local environment
Copy `.env.example` to `.env.local`. Keep the secret key only in this server-side file. Never commit `.env.local`.

## Before real attendance data
Create the first company, factory, and administrator profile. The administrator profile must reference an Auth user UUID and a company/factory UUID. Do not use sample employees or fake attendance as production data.

## CCTV and AI
The schema and signed camera-event ingestion endpoint are foundations only. A camera gateway/edge service must be deployed and tested against the factory's actual camera model, stream protocol, network, and privacy policy. AI analysis also requires a separately configured provider key. Face recognition must have a documented legal basis, access controls, retention limits, and a human review path.
