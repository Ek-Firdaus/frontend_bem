# PRD — SIM-BEM (Sistem Informasi Manajemen Internal BEM)

**Author:** Secretary of BEM  
**Tech Stack:** PERN Stack (PostgreSQL, Express, React, Node.js)  
**Pendekatan:** Bertahap — Backend selesai dulu, baru Frontend per fitur

---

## Roles & Akses

| Role          | Deskripsi                                      |
| ------------- | ---------------------------------------------- |
| `super_admin` | Akses penuh ke semua modul                     |
| `executive`   | Read-only dashboard & laporan                  |
| `admin_sekre` | CRUD Inventaris & Surat                        |
| `admin_psdm`  | CRUD Absensi & Laporan                         |
| `member`      | Input token absensi & lihat katalog inventaris |

---

## FASE 1 — Modul Absensi

### Backend — ✅ Selesai

- [x] Auth (login dengan npm + password, return JWT)
- [x] RBAC middleware (`checkRole`)
- [x] `POST /events` — Buat event (admin_psdm, super_admin)
- [x] `GET /events` — List semua event
- [x] `GET /events/:id` — Detail event
- [x] `PUT /events/:id/` — Buka/tutup sesi absensi, generate token baru saat dibuka, insert `absent` ke semua member yang belum hadir saat ditutup
- [x] `POST /attendances/` — Member input token untuk presensi
- [x] `GET /attendances/:event_id` — Lihat log presensi per event (admin_psdm, super_admin)
- [x] `GET /my-attendances` — Lihat log presensi per user (member)
- [ ] `GET /attendances/export/:event_id` — Export laporan presensi (CSV/PDF)

### Frontend — 🔲 Belum Dimulai

**Halaman Auth**

- [ ] Halaman Login (input npm + password)
- [ ] Simpan JWT ke localStorage / cookie
- [ ] Protected route berdasarkan role
- [ ] Redirect ke dashboard sesuai role setelah login

**Dashboard Admin (admin_psdm & super_admin)**

- [ ] Halaman list semua event (tabel dengan status aktif/nonaktif)
- [ ] Form buat event baru (nama, start_time, end_time, is_active)
- [ ] Halaman detail event — tampilkan token aktif secara besar & jelas
- [ ] Toggle buka/tutup sesi absensi (tampilkan token baru saat dibuka)
- [ ] Countdown timer saat sesi aktif
- [ ] Tabel real-time log absensi (nama, npm, clock_in_time, status)
- [ ] Tombol export laporan (CSV / PDF)

**Halaman Member**

- [ ] Input box token absensi (clean, mobile-friendly)
- [ ] Validasi token salah/expired tanpa refresh halaman
- [ ] Tombol submit otomatis terkunci saat sesi ditutup admin
- [ ] Tampilkan konfirmasi sukses absen (warna Emerald Green)

---

## FASE 2 — Modul Inventaris

### Backend — 🔲 Belum Dimulai

- [ ] `POST /assets` — Tambah aset baru + generate QR code
- [ ] `GET /assets` — List semua aset
- [ ] `GET /assets/:id` — Detail aset
- [ ] `PUT /assets/:id` — Update data aset
- [ ] `DELETE /assets/:id` — Hapus aset
- [ ] `GET /assets/qr/:token` — Lookup aset via token QR
- [ ] `PATCH /assets/:id/status` — Toggle status available/borrowed

### Frontend — ⏸ Tunggu Backend Selesai

- [ ] Dashboard grid aset (kondisi & status availability)
- [ ] Badge visual untuk aset yang sedang dipinjam (merah/amber)
- [ ] Webcam scanner modal (html5-qrcode) — mobile-friendly
- [ ] Scan QR → otomatis toggle status aset
- [ ] Detail aset modal

---

## FASE 3 — Modul Peminjaman & Pengembalian

### Backend — 🔲 Belum Dimulai

- [ ] `POST /loans` — Buat peminjaman baru
- [ ] `GET /loans` — List semua peminjaman
- [ ] `GET /loans/:id` — Detail peminjaman
- [ ] `PATCH /loans/:id/return` — Proses pengembalian aset
- [ ] Validasi peminjam: internal (user_id) vs eksternal (nama & institusi)

### Frontend — ⏸ Tunggu Backend Selesai

- [ ] Form peminjaman dinamis (beda field untuk internal vs eksternal)
- [ ] Halaman riwayat peminjaman dengan filter
- [ ] Proses pengembalian via scan QR atau manual
- [ ] Notifikasi aset berhasil dikembalikan (Emerald Green)

---

## FASE 4 — Modul Surat (Opsional / Prioritas Terakhir)

### Backend — 🔲 Belum Dimulai

- [ ] Upload surat masuk/keluar (PDF)
- [ ] Auto-increment nomor surat keluar
- [ ] `GET /mails` — List surat dengan filter (tanggal, jenis, subjek)

### Frontend — ⏸ Tunggu Backend Selesai

- [ ] Tabel arsip surat dengan filter lengkap
- [ ] Drag-and-drop upload PDF + input metadata
- [ ] Modal detail surat + embedded PDF viewer
- [ ] Tampilkan nomor surat otomatis saat draft surat keluar

---

## Catatan Desain

- **Tema:** Minimalist Modern — Navy Blue, White, Emerald Green (sukses)
- **Desktop:** Dashboard admin, tabel laporan, form manajemen
- **Mobile-friendly wajib:** Halaman input token absensi member & webcam QR scanner
- **Target response time:** < 2 detik untuk submit token & lookup QR
