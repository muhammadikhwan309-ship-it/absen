# PlantTrack AI
## Product Requirements Document (PRD)
**Versi:** 1.0  
**Fokus tahap pertama:** Frontend

## 1. Ringkasan Produk

PlantTrack AI adalah aplikasi web untuk pengelolaan kehadiran karyawan pabrik yang menggabungkan pengenalan wajah berbantuan AI, pemantauan kamera gerbang, pemetaan area pabrik, manajemen shift, dan analitik kehadiran. Kamera di titik akses yang ditetapkan mendeteksi peristiwa masuk atau keluar. Layanan AI membantu mengidentifikasi karyawan, sedangkan backend memvalidasi aturan absensi dan menyimpan catatan.

Pengembangan dimulai dari frontend lengkap dengan data demonstrasi. Integrasi CCTV, pemrosesan AI, database, autentikasi server, dan notifikasi nyata dilakukan pada tahap berikutnya.

## 2. Tujuan dan Ukuran Keberhasilan

- Menyediakan satu dashboard untuk memantau kehadiran di satu atau beberapa pabrik.
- Mencatat check-in dan check-out dari peristiwa kamera di gerbang yang telah dikonfigurasi.
- Memetakan lokasi pabrik, area kerja, gerbang, dan kamera.
- Membantu HRD memeriksa keterlambatan, ketidakhadiran, dan kejadian yang perlu ditinjau.
- Menyediakan laporan yang dapat difilter dan diekspor.
- Menyediakan antarmuka Bahasa Indonesia dan English.

### Kriteria penerimaan frontend

| Indikator | Kriteria |
|---|---|
| Navigasi | Semua menu utama dapat dibuka dan kembali tanpa tautan rusak. |
| Data demonstrasi | Tabel, kartu, grafik, dan aktivitas menggunakan data contoh yang konsisten. |
| Interaksi | Pencarian, filter, tab, formulir, modal, dan pengaturan bahasa berfungsi pada frontend. |
| Peta | Peta demonstrasi menampilkan lokasi pabrik, area, gerbang, dan kamera, bukan lokasi CCTV sungguhan. |
| CCTV | Halaman monitoring menampilkan status dan pratinjau demonstrasi, bukan streaming nyata. |
| Responsif | Tampilan dapat digunakan pada desktop, tablet, dan ponsel. |

## 3. Pengguna dan Hak Akses

| Peran | Kewenangan utama |
|---|---|
| Super Admin | Mengelola seluruh perusahaan, pabrik, akun, konfigurasi, dan audit. |
| Admin Pabrik | Mengelola satu pabrik, kamera, gerbang, area, dan data operasional. |
| HRD | Mengelola karyawan, shift, absensi, koreksi, dan laporan. |
| Supervisor | Melihat kehadiran tim dan meninjau kejadian yang ditugaskan. |
| Security | Memantau kamera gerbang dan meninjau kejadian akses yang relevan. |
| Karyawan | Melihat riwayat kehadiran dan mengajukan koreksi atau izin sesuai kebijakan. |

## 4. Ruang Lingkup

### 4.1 Termasuk dalam frontend versi pertama

- Halaman login demonstrasi dan pemilihan peran uji.
- Dashboard ringkasan kehadiran.
- Peta area pabrik dengan marker kamera, gerbang, dan area.
- Monitoring CCTV berupa panel pratinjau demonstrasi dan status perangkat.
- Daftar karyawan, detail profil, tambah/edit, pencarian, filter, dan pagination.
- Daftar absensi, detail kejadian, status validasi, dan alur tinjauan manual.
- Pengelolaan shift, departemen, pabrik, area, gerbang, dan kamera.
- AI Analytics dan AI Assistant dengan jawaban demonstrasi yang diberi label simulasi.
- Laporan, notifikasi, pengaturan akun, tema, dan multibahasa.
- Validasi formulir dan penyimpanan preferensi lokal yang tidak sensitif.

### 4.2 Tidak termasuk dalam frontend versi pertama

- Koneksi CCTV/IP Camera dan streaming RTSP/ONVIF sungguhan.
- Pengenalan wajah atau deteksi arah gerak sungguhan.
- Penyimpanan template biometrik dan database produksi.
- Validasi absensi otomatis yang benar-benar mengubah data kehadiran.
- Autentikasi, penegakan role, dan audit server.
- Integrasi API AI, notifikasi, ekspor server, atau sinkronisasi lintas pabrik.

## 5. Alur Bisnis Absensi Otomatis

1. Karyawan melewati jalur masuk atau keluar yang telah ditetapkan.
2. Kamera gerbang menangkap video sesuai konfigurasi dan kebijakan perusahaan.
3. Layanan pemrosesan video mendeteksi orang dan menentukan arah pergerakan berdasarkan zona/garis virtual atau sensor akses.
4. Model pengenalan wajah mencoba mencocokkan wajah dengan identitas karyawan yang terdaftar dan diizinkan.
5. Backend memeriksa tingkat keyakinan, status karyawan, kamera, gerbang, jadwal shift, dan catatan absensi sebelumnya.
6. Jika seluruh aturan terpenuhi, backend membuat peristiwa check-in atau check-out.
7. Jika identitas tidak pasti, arah tidak jelas, atau aturan bertentangan, sistem membuat kejadian untuk pemeriksaan manusia dan tidak langsung mengunci status absensi.
8. Dashboard menerima pembaruan dan menampilkan hasil, waktu, kamera, status, serta alasan jika perlu ditinjau.

**Catatan desain:** Identifikasi wajah saja tidak cukup untuk menyimpulkan masuk atau keluar. Arah harus ditentukan dari konfigurasi gerbang, zona/garis virtual, sensor akses, atau perangkat kontrol akses.

## 6. Kebutuhan Fungsional

| ID | Modul | Kebutuhan |
|---|---|---|
| FR-01 | Login & role demo | Pengguna dapat masuk ke lingkungan demonstrasi dan memilih role uji. Ini bukan autentikasi produksi. |
| FR-02 | Dashboard | Menampilkan total karyawan, hadir, terlambat, izin, tidak hadir, aktivitas terbaru, grafik, dan ringkasan lintas pabrik. |
| FR-03 | Pemetaan | Menampilkan pabrik, area, gerbang, kamera, serta status perangkat. Mendukung filter dan detail marker. |
| FR-04 | Monitoring kamera | Menampilkan daftar kamera, status online/offline, lokasi, gerbang terkait, waktu heartbeat, dan panel pratinjau demo. |
| FR-05 | Karyawan | Melihat, mencari, memfilter, menambah, mengubah, dan menonaktifkan data karyawan demonstrasi. |
| FR-06 | Absensi | Menampilkan check-in/out, status, waktu, kamera sumber, confidence/hasil verifikasi jika tersedia, dan status tinjauan. |
| FR-07 | Review kejadian | Petugas berwenang dapat menyetujui, menolak, atau meminta pemeriksaan ulang pada data demonstrasi. |
| FR-08 | Shift | Mengelola jam mulai, jam selesai, toleransi, hari kerja, dan shift lintas tengah malam. |
| FR-09 | Struktur pabrik | Mengelola perusahaan, pabrik, departemen, area, gerbang, dan kamera. |
| FR-10 | AI Analytics | Menampilkan tren, keterlambatan, pola anomali, dan ringkasan. Hasil demonstrasi harus diberi label simulasi. |
| FR-11 | AI Assistant | Menyediakan antarmuka tanya-jawab berbasis data demonstrasi dan menyatakan batas data yang digunakan. |
| FR-12 | Laporan | Filter tanggal, pabrik, departemen, shift, dan status; tampilan tabel serta kontrol ekspor demonstrasi. |
| FR-13 | Notifikasi | Menampilkan kejadian baru, kamera offline, identitas tidak dikenal, dan item yang perlu ditinjau. |
| FR-14 | Bahasa | Semua teks antarmuka utama tersedia dalam Bahasa Indonesia dan English. |
| FR-15 | Pengaturan | Tema terang/gelap, profil demonstrasi, preferensi bahasa, dan pengaturan tampilan. |

## 7. Aturan Bisnis dan Kasus Khusus

- Satu peristiwa kamera tidak boleh menghasilkan beberapa catatan absensi berulang. Gunakan aturan deduplikasi dan jeda/cooldown yang dapat dikonfigurasi.
- Check-out hanya dibuat jika aturan shift dan status absensi memungkinkan. Sistem tidak boleh mengubah check-in menjadi check-out hanya berdasarkan tebakan.
- Shift malam harus mendukung jam selesai pada tanggal berikutnya.
- Kamera offline, waktu perangkat tidak sinkron, atau koneksi terputus harus ditandai dan tidak boleh menghasilkan klaim absensi yang tidak didukung.
- Kecocokan wajah dengan confidence rendah atau identitas ganda masuk antrean tinjauan manual.
- Sediakan jalur alternatif absensi untuk karyawan yang tidak dapat atau tidak ingin menggunakan pengenalan wajah, sesuai kebijakan dan dasar pemrosesan yang sah.
- Koreksi absensi harus menyimpan alasan, pelaku perubahan, waktu, dan nilai sebelum/sesudah pada audit log.

## 8. Data Utama yang Direncanakan

| Entitas | Field inti |
|---|---|
| Employee | employee_id, nik, name, department_id, factory_id, shift_id, employment_status, photo_reference |
| AttendanceEvent | event_id, employee_id, event_type, event_time, gate_id, camera_id, status, review_status |
| Camera | camera_id, name, factory_id, area_id, gate_id, connection_status, stream_reference, last_seen |
| Gate | gate_id, name, factory_id, direction_configuration, active_status |
| Factory | factory_id, name, address, latitude, longitude |
| Area | area_id, factory_id, name, boundary_geometry, area_type |
| Shift | shift_id, name, start_time, end_time, tolerance_minutes, crosses_midnight |
| ReviewLog | review_id, event_id, reviewer_id, decision, reason, created_at |
| AuditLog | actor_id, action, target_type, target_id, before_value, after_value, timestamp |

## 9. Kebutuhan Non-Fungsional

- Antarmuka responsif dan mudah dipahami oleh pengguna operasional.
- Pemisahan hak akses dilakukan di backend saat integrasi. Menyembunyikan menu di frontend bukan kontrol keamanan yang cukup.
- Data biometrik harus dilindungi dengan kontrol akses ketat, enkripsi, retensi terbatas, dan audit.
- Video tidak disimpan secara permanen secara default. Kebijakan penyimpanan dan akses rekaman harus ditentukan perusahaan.
- Sediakan indikator status data: demonstrasi, tertunda, terverifikasi, atau perlu tinjauan.
- Sistem produksi harus memiliki sinkronisasi waktu, pencatatan kegagalan, pemantauan layanan, dan mekanisme pemulihan.

## 10. Privasi, Keamanan, dan Tata Kelola

Pengenalan wajah memproses data biometrik yang tergolong data pribadi spesifik menurut UU Pelindungan Data Pribadi Indonesia. Sebelum produksi, perusahaan perlu menetapkan dasar pemrosesan yang sah, tujuan yang spesifik, pemberitahuan yang jelas, penilaian dampak pelindungan data bila diwajibkan, pembatasan akses, masa retensi, prosedur penghapusan, dan jalur alternatif.

Jangan menggunakan hasil AI sebagai satu-satunya dasar tindakan disipliner atau keputusan ketenagakerjaan.

## 11. Teknologi Rekomendasi

| Lapisan | Pilihan awal |
|---|---|
| Frontend | React + TypeScript + Vite, Tailwind CSS, React Router, Lucide |
| Peta | Leaflet + OpenStreetMap; sumber tile harus mengikuti ketentuan penyedia |
| Grafik | Recharts |
| Backend (tahap berikutnya) | Laravel atau Node.js, dipilih setelah kebutuhan integrasi dikunci |
| AI/video (tahap berikutnya) | Python, OpenCV, model deteksi/pengenalan yang telah ditinjau lisensi dan kinerjanya |
| Database (tahap berikutnya) | PostgreSQL; pertimbangkan PostGIS untuk data geospasial |
| CCTV | IP camera yang mendukung protokol dan integrasi yang disepakati, misalnya RTSP/ONVIF |

## 12. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Wajah salah dikenali | Ambang confidence, pemeriksaan manusia, jalur alternatif, dan evaluasi berkala. |
| Arah masuk/keluar keliru | Kamera terpisah per arah atau zona/garis virtual dan uji lapangan. |
| Kondisi cahaya buruk/kerumunan | Survei posisi kamera, pencahayaan, kualitas gambar, dan beberapa sudut bila perlu. |
| CCTV tidak kompatibel | Uji model kamera dan protokol sebelum pengadaan. |
| Penyalahgunaan data biometrik | Pembatasan akses, enkripsi, retensi, audit, dan tata kelola privasi. |
| Koneksi jaringan terputus | Buffer lokal yang aman, sinkronisasi ulang, dan penandaan status tertunda. |

## 13. Tahapan Pengembangan

1. **Tahap 1 - Frontend:** seluruh halaman, komponen, data demo, navigasi, filter, bahasa, tema, dan alur interaksi.
2. **Tahap 2 - Backend:** API, database, autentikasi, role, audit log, dan aturan absensi.
3. **Tahap 3 - CCTV:** uji kompatibilitas kamera, koneksi stream, status perangkat, dan konfigurasi gerbang.
4. **Tahap 4 - AI:** deteksi orang, pengenalan wajah, penentuan arah, evaluasi akurasi, dan alur tinjauan manusia.
5. **Tahap 5 - Pilot:** uji pada satu gerbang dengan kelompok terbatas, jalur alternatif, dan evaluasi dampak.
6. **Tahap 6 - Rollout:** perluasan area/pabrik setelah hasil pilot memenuhi kriteria.

## 14. Definisi Selesai untuk Frontend

- Seluruh halaman yang ditetapkan tersedia dan dapat dinavigasi.
- Tidak ada tombol penting yang hanya menjadi dekorasi.
- Tabel, pencarian, filter, modal, formulir, tab, dan pengaturan berfungsi dengan data demo.
- Semua tampilan data demo diberi penanda agar tidak disalahartikan sebagai data produksi.
- Bahasa Indonesia dan English konsisten di seluruh halaman.
- Layout diuji pada desktop, tablet, dan ponsel.
- Halaman CCTV tidak mengklaim streaming nyata jika belum terhubung ke perangkat.
