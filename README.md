# PlantTrack AI

Sistem web pemantauan dan pengelolaan absensi karyawan pabrik berbantuan AI.

## Tahap pengembangan

Tahap pertama berfokus pada frontend menggunakan data demonstrasi. Integrasi backend, database, CCTV/IP Camera, pemrosesan video, pengenalan wajah, dan notifikasi nyata dilakukan pada tahap berikutnya.

## Dokumen proyek

- [PRD PlantTrack AI](docs/01-PRD-PlantTrack-AI.md)
- [Flow Sistem dan Alur Pengguna](docs/02-Flow-Sistem-PlantTrack-AI.md)

## Teknologi awal

- React + TypeScript + Vite
- Tailwind CSS
- React Router dan Lucide
- Leaflet + OpenStreetMap
- Recharts

## Catatan

Tampilan CCTV pada tahap frontend merupakan pratinjau demonstrasi, bukan streaming kamera nyata. Hasil AI demonstrasi harus diberi label simulasi. Kejadian yang meragukan harus masuk tinjauan manual dan tidak boleh otomatis merugikan karyawan.
