# Execution Tasks for AI Agent

Catatan: Langkah inisialisasi lingkungan, konfigurasi `.env`, dan instalasi dependensi dasar dikelola secara manual. Fokus tugas AI Agent adalah langsung membuat kode sumber, file migrasi, seeder, controller, job, dan komponen UI.

---

## Backend Implementation Tasks (Folder: `backend/`)

### Task 1: Migrations & Models
- [ ] Buat file migrasi tabel `users` (dengan field `role`: enum 'admin', 'member')[cite: 1].
- [ ] Buat file migrasi tabel `tasks` (relasi `assigned_user_id` & `created_by` ke tabel `users`, indeks pada `status`, `priority`, dan `due_date`)[cite: 1].
- [ ] Buat file migrasi tabel `task_attachments` (relasi `task_id` ke tabel `tasks` cascade delete)[cite: 1].
- [ ] Buat file migrasi tabel `task_comments` (relasi `task_id` dan `user_id` cascade delete)[cite: 1].
- [ ] Buat Eloquent Model: `User`, `Task`, `TaskAttachment`, dan `TaskComment` lengkap dengan relasinya (`hasMany`, `belongsTo`).

### Task 2: Database Seeders
- [ ] Buat seeder data awal dengan ketentuan[cite: 1]:
  - Minimal 5 users dengan email unik dan password seragam (`password123`)[cite: 1].
  - Minimal 15 tasks dengan variasi status, prioritas, dan tanggal jatuh tempo[cite: 1].
  - Minimal 10 comments yang tersebar di beberapa task[cite: 1].

### Task 3: Authentication Endpoints
- [ ] Buat `AuthController` dengan method:
  - `login`: Validasi input, periksa kredensial, buat JWT token, kembalikan user profile[cite: 1].
  - `logout`: Revoke/invalidate token yang sedang aktif[cite: 1].
  - `me`: Mengembalikan data user yang terautentikasi[cite: 1].
- [ ] Daftarkan route auth pada `routes/api.php`[cite: 1].

### Task 4: Task & Comment CRUD Endpoints
- [ ] Buat Form Request class untuk validasi pembuatan dan pembaruan task.
- [ ] Buat `TaskController` dengan method:
  - `index`: Menangani paginasi (default 10), filtering (`status`, `priority`), search (`title`), dan sorting (`created_at`, `due_date`)[cite: 1].
  - `store`: Menyimpan data task baru dan dispatch background job notifikasi penugasan[cite: 1].
  - `show`: Mengambil detail task beserta relasi assignee, creator, attachments, dan comments.
  - `update`: Memperbarui data task[cite: 1].
  - `destroy`: Menghapus task beserta berkas fisiknya[cite: 1].
- [ ] Buat `CommentController` untuk menambahkan dan melihat daftar komentar pada task[cite: 1].

### Task 5: File Attachment System & Background Queue
- [ ] Buat `AttachmentController` dengan method:
  - `upload`: Validasi tipe berkas (gambar, dokumen, video) dan ukuran (maks 25MB), simpan berkas fisik ke `storage/app/public/attachments`, simpan metadata ke database, lalu dispatch job thumbnail jika format berkas adalah gambar[cite: 1].
  - `download`: Mengembalikan stream berkas untuk diunduh[cite: 1].
  - `destroy`: Menghapus berkas fisik dan record dari database[cite: 1].
- [ ] Buat Queue Job `SendTaskAssignedNotification` untuk simulasi pengiriman email penugasan tugas[cite: 1].
- [ ] Buat Queue Job `GenerateThumbnailJob` untuk membuat thumbnail gambar secara asinkron[cite: 1].

### Task 6: Real-Time Stream Endpoint
- [ ] Buat endpoint Server-Sent Events (SSE) `GET /api/tasks/events` atau implementasi websocket driver untuk mengirim event perubahan tugas secara live ke client[cite: 1].

---

## Frontend Implementation Tasks (Folder: `frontend/`)

### Task 7: API Client & Auth State
- [ ] Buat modul Axios instance / HTTP client wrapper dengan base URL dan interceptor token bearer.
- [ ] Buat Auth Context / Store untuk menyimpan data profil pengguna, token, dan fungsi login/logout[cite: 1].
- [ ] Buat route protection (Next.js middleware) untuk mengalihkan pengguna non-autentikasi ke `/login`[cite: 1].

### Task 8: Authentication Page
- [ ] Buat halaman Login (`/login`) dengan form input email, password, validasi error state, dan penanganan submit ke endpoint `/api/auth/login`[cite: 1].

### Task 9: Task Dashboard Page (`/dashboard`)
- [ ] Buat layout header menampilkan info nama pengguna, badge role, dan tombol logout[cite: 1].
- [ ] Buat toolbar filter: input pencarian, dropdown filter status (`all`, `pending`, `in_progress`, `completed`), dan dropdown filter prioritas[cite: 1].
- [ ] Buat komponen daftar tugas (Task List / Grid Cards) lengkap dengan indikator paginasi[cite: 1].
- [ ] Buat modal form untuk menambah tugas baru dan mengedit tugas yang sudah ada[cite: 1].

### Task 10: Task Detail Modal, Attachment, & Comments
- [ ] Buat modal detail tugas yang menampilkan deskripsi lengkap, assignee, tenggat waktu, dan tombol aksi ubah status[cite: 1].
- [ ] Buat komponen unggah berkas drag-and-drop yang mengirim berkas ke endpoint lampiran tugas[cite: 1].
- [ ] Tampilkan daftar lampiran dengan aksi unduh dan hapus[cite: 1].
- [ ] Buat komponen komentar: riwayat percakapan dan input form untuk menambah komentar baru[cite: 1].

### Task 11: Real-Time Integration
- [ ] Sambungkan listener SSE / WebSocket ke state dashboard sehingga daftar tugas dan riwayat komentar langsung diperbarui otomatis ketika ada data masuk[cite: 1].

---

## Documentation & Testing Tasks

### Task 12: API Collection & Automated Tests
- [ ] Buat berkas koleksi API JSON (Postman Collection) di `documentation/api-docs/task_api_collection.json`[cite: 1].
- [ ] Buat minimal 2 Feature Test di `backend/tests/Feature/TaskApiTest.php` untuk menguji alur login dan CRUD task[cite: 1].