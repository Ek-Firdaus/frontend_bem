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
- [x] `DELETE /events/:id` — Hapus event (admin_psdm, super_admin)

- [x] `POST /attendances/` — Member input token untuk presensi
- [x] `GET /attendances/:event_id` — Lihat log presensi per event (admin_psdm, super_admin)
- [x] `GET /my-attendances` — Lihat log presensi per user (member)
- [x] `GET /attendances/export/` — Export laporan presensi semua event(excel) (super_admin, admin_psdm)
- [x] `GET /attendances/:event_id/export/` — Export laporan presensi per event(excel) (super_admin, admin_psdm)

- [x] `GET /users/profile` — Lihat data diri user (member)
- [x] `PATCH /users/profile` — Update password user (member)

Menambahkan endpoint untuk kelola users pada super admin
- [x] `POST /users` — Buat user baru (admin_psdm, super_admin)
- [x] `GET /users` — List semua user (admin_psdm, super_admin)
- [x] `PUT /users/:id` — Update data user (admin_psdm, super_admin)
- [x] `DELETE /users/:id` — Hapus user (admin_psdm, super_admin)

### Frontend — ✅ Selesai

**Halaman Auth**

- [x] Halaman Login (input npm + password)
- [x] Simpan JWT ke localStorage / cookie
- [x] Protected route berdasarkan role
- [x] Redirect ke dashboard sesuai role setelah login

**Dashboard Admin (admin_psdm & super_admin)**

- [x] Halaman list semua event (tabel dengan status aktif/nonaktif)
- [x] Form buat event baru (nama, start_time, end_time, is_active)
- [x] Halaman detail event — tampilkan token aktif secara besar & jelas
- [x] Toggle buka/tutup sesi absensi (tampilkan token baru saat dibuka)
- [x] Countdown timer saat sesi aktif
- [x] Tabel real-time log absensi (nama, npm, clock_in_time, status)
- [x] Tombol export laporan (Excel)

**Halaman Member**

- [x] Input box token absensi (clean, mobile-friendly)
- [x] Validasi token salah/expired tanpa refresh halaman
- [x] Tombol submit otomatis terkunci saat sesi ditutup admin
- [x] Tampilkan konfirmasi sukses absen (warna Emerald Green)

---

## FASE 2 — Modul Inventaris

### Backend — 🔲 Belum Dimulai

- [x] `POST /inventories` — Tambah aset baru + generate QR code
- [x] `GET /inventories` — List semua aset
- [x] `GET /inventories/:id` — Detail aset
- [x] `PUT /inventories/:id` — Update data aset
- [ ] `DELETE /inventories/:id` — Hapus aset
- [ ] `GET /inventories/qr/:token` — Lookup aset via token QR
- [ ] `PATCH /inventories/:id/status` — Toggle status available/borrowed

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
