# PlantTrack AI - Backend Setup

## Arsitektur yang dipakai
- Database dan autentikasi: Supabase PostgreSQL + Supabase Auth.
- API: Vercel Functions pada folder `api/`.
- AI Assistant: OpenAI API dipanggil dari server, bukan browser.
- CCTV: agent pemrosesan video di jaringan pabrik mengirim event bertanda tangan ke `POST /api/camera-events`.
- Frontend: Vite/React. Kunci service role dan AI hanya disimpan sebagai Environment Variables server Vercel.

## 1. Siapkan Supabase
1. Buat project Supabase baru.
2. Buka SQL Editor dan jalankan seluruh file `supabase/migrations/202611220001_initial_schema.sql`.
3. Buat company, factory, dan profile admin pertama. Buat user melalui Authentication terlebih dahulu, lalu masukkan baris `profiles` menggunakan UUID user tersebut.
4. Ambil Project URL, anon/public key, dan service_role key dari Project Settings > API.

Contoh pembuatan data awal (ganti UUID dan nama):
```sql
insert into public.companies (id,name) values ('11111111-1111-4111-8111-111111111111','PT. Industri Nusantara');
insert into public.factories (id,company_id,name,address) values ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Pasuruan Plant','Pasuruan, Jawa Timur');
-- Ganti UUID user dengan ID dari Supabase Auth:
insert into public.profiles (id,company_id,factory_id,full_name,role)
values ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','Administrator','super_admin');
```

## 2. Atur Environment Variables Vercel
Project Settings > Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, jangan pernah gunakan prefix VITE_)
- `OPENAI_API_KEY` (server only; API billing terpisah dari langganan ChatGPT)
- `OPENAI_MODEL` (opsional, default gpt-4.1-mini)
- `CAMERA_INGEST_SECRET` (rahasia acak minimal 32 byte)

Untuk frontend build, tambahkan:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Setelah mengubah environment variables, lakukan redeploy.

## 3. API yang tersedia
- `GET /api/health`: status koneksi database.
- `GET /api/employees?page=1&limit=20&search=andi`: daftar karyawan, memerlukan Supabase access token.
- `POST /api/employees`: tambah karyawan, role super_admin/factory_admin/hrd.
- `GET /api/attendance?page=1&limit=50&status=needs_review`: daftar event, memerlukan access token.
- `POST /api/ai/assistant`: ringkasan dan tanya-jawab berbasis agregat 30 hari, memerlukan access token dan API key AI.
- `POST /api/camera-events`: ingest event dari edge agent menggunakan HMAC SHA-256 pada raw JSON body, header `x-planttrack-signature: sha256=<hex>`.

## 4. Payload event kamera
```json
{
  "camera_id": "UUID_CAMERA",
  "external_event_id": "CAM01-20261122-000001",
  "employee_id": "UUID_EMPLOYEE_OR_NULL",
  "occurred_at": "2026-11-22T07:42:18+07:00",
  "direction": "in",
  "confidence": 0.97,
  "metadata": { "detector": "edge-agent-v1" }
}
```
Tanda tangan dihitung sebagai HMAC-SHA256 dari string JSON persis yang dikirim, memakai `CAMERA_INGEST_SECRET`.

## Batasan yang belum boleh dianggap produksi
- Kamera belum dikoneksikan karena model, alamat, protokol, jumlah kamera, dan jaringan pabrik belum diketahui.
- Pengenalan wajah/liveness belum disediakan oleh API ini. Edge agent harus diuji dan dinilai secara terpisah.
- UI login dan seluruh halaman frontend belum dialihkan dari data demo ke API. API foundation sudah tersedia, tetapi integrasi UI masih tahap berikutnya.
- Kebijakan retensi biometrik, persetujuan/pemberitahuan, dasar pemrosesan, DPIA bila diwajibkan, dan jalur absensi alternatif harus disetujui perusahaan sebelum pemrosesan biometrik.
- Jangan memakai data demo untuk payroll atau tindakan disipliner.
