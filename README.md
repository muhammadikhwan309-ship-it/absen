# PlantTrack AI

Aplikasi web pemantauan dan pengelolaan absensi karyawan pabrik.

## Menjalankan aplikasi

Persyaratan: Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Pemeriksaan dan build:

```bash
npm run typecheck
npm run build
npm run preview
```

## Teknologi

- React 18 + TypeScript
- Vite 6
- Supabase PostgreSQL dan Auth (fondasi integrasi)
- Vercel Functions
- Lucide React

## Modul frontend

Dashboard, peta area, monitoring CCTV, data karyawan, absensi, shift, struktur pabrik, AI Analytics, laporan, notifikasi, pengaturan.

## Dokumen

- [PRD](docs/01-PRD-PlantTrack-AI.md)
- [Flow Sistem](docs/02-Flow-Sistem-PlantTrack-AI.md)
- [Setup Supabase](docs/03-Supabase-Setup.md)

## Status dan batasan

Database Supabase dan skema awal sudah dibuat. Variabel URL dan publishable key telah dimasukkan ke Vercel. API memerlukan secret key server-only sebelum dapat mengakses database sebagai backend. Sebagian tampilan frontend masih menggunakan data demo. CCTV, pengenalan wajah, AI provider, dan integrasi kamera belum siap produksi.

Jangan gunakan data demo sebagai absensi resmi. Gunakan tinjauan manusia, metode absensi alternatif, perlindungan data biometrik, dan audit akses.
