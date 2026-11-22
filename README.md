# PlantTrack AI

Aplikasi web frontend untuk pemantauan dan pengelolaan absensi karyawan pabrik.

## Menjalankan aplikasi

Persyaratan: Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Untuk memeriksa TypeScript dan membuat build produksi:

```bash
npm run typecheck
npm run build
npm run preview
```

## Teknologi

- React 19 + TypeScript
- Vite 6
- Lucide React
- CSS responsif, tema terang/gelap

## Modul

- Dashboard ringkasan kehadiran dan tren
- Peta denah area pabrik dan marker kamera (ilustrasi)
- Monitoring CCTV dan status kamera (pratinjau demo)
- Data karyawan: pencarian, filter, tambah karyawan
- Data absensi: pencarian, filter, tinjauan manual
- Manajemen shift
- Struktur pabrik dan departemen
- AI Analytics (data simulasi)
- Laporan (pratinjau)
- Notifikasi
- Pilihan bahasa Indonesia/English untuk navigasi dan judul halaman, serta tema terang/gelap

## Dokumen proyek

- [Product Requirements Document](docs/01-PRD-PlantTrack-AI.md)
- [Flow Sistem dan Alur Pengguna](docs/02-Flow-Sistem-PlantTrack-AI.md)

## Pemeriksaan kualitas\n\nGitHub Actions menjalankan pemeriksaan TypeScript dan build produksi setiap ada push ke branch `main` atau pull request. Hasil build perlu dilihat pada tab Actions setelah workflow selesai.\n\n## Status integrasi

Versi ini adalah frontend demonstrasi. Data contoh disimpan di state aplikasi dan akan kembali ke data awal saat halaman dimuat ulang. CCTV/IP Camera, pengenalan wajah, penentuan arah masuk/keluar, model AI, database, API, autentikasi produksi, otorisasi role, audit server, dan ekspor file belum terhubung.

Jangan gunakan data demonstrasi sebagai catatan kehadiran resmi. Untuk produksi, terapkan tinjauan manusia, metode absensi alternatif, perlindungan data biometrik, dan audit akses.
