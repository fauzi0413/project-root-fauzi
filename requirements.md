# Requirements Specification

## 1. Project Overview
Platform Task Management berbasis web full-stack dengan backend PHP (Laravel), frontend Next.js, dan basis data MySQL lokal. Sistem menangani autentikasi JWT, manajemen tugas, lampiran berkas, pemrosesan antrean latar belakang, dan sinkronisasi data real-time.

---

## 2. Functional Requirements

### 2.1 Backend (PHP / Laravel)
- **Database Schema**:
  - `users`: `id`, `name`, `email` (unique), `password`, `role` (`admin`/`member`), timestamps.
  - `tasks`: `id`, `title`, `description`, `status` (`pending`/`in_progress`/`completed`), `priority` (`low`/`medium`/`high`), `assigned_user_id` (fk users), `created_by` (fk users), `due_date`, timestamps.
  - `task_attachments`: `id`, `task_id` (fk tasks, cascade), `file_name`, `file_path`, `file_size`, `mime_type`, `uploaded_at`.
  - `task_comments`: `id`, `task_id` (fk tasks, cascade), `user_id` (fk users, cascade), `comment`, timestamps[cite: 1].
- **Seeders**:
  - Minimal 5 pengguna dengan kata sandi terstandarisasi[cite: 1].
  - Minimal 15 tugas yang mencakup variasi status dan prioritas[cite: 1].
  - Minimal 10 komentar terdistribusi pada berbagai tugas[cite: 1].
- **Authentication**:
  - `POST /api/auth/login`: Validasi kredensial dan kembalikan token JWT beserta profil pengguna[cite: 1].
  - `POST /api/auth/logout`: Invalidate token[cite: 1].
  - `GET /api/auth/me`: Mengembalikan data user yang sedang login[cite: 1].
- **Task Management**:
  - `GET /api/tasks`: Mendukung paginasi, filter (`status`, `priority`, pencarian judul), dan sorting (`due_date`, `created_at`)[cite: 1].
  - `POST /api/tasks`: Validasi input dan pembuatan data tugas baru[cite: 1].
  - `PUT /api/tasks/{id}`: Pembaruan data tugas[cite: 1].
  - `DELETE /api/tasks/{id}`: Penghapusan tugas beserta relasi lampiran dan komentar[cite: 1].
- **Comment Management**:
  - `GET /api/tasks/{id}/comments`: Mengambil daftar komentar pada tugas tertentu.
  - `POST /api/tasks/{id}/comments`: Menambahkan komentar baru.
- **File Management**:
  - `POST /api/tasks/{id}/attachments`: Validasi tipe MIME (gambar, dokumen, video) dan batas ukuran, simpan berkas, lalu picu pembuatan thumbnail jika berupa gambar[cite: 1].
  - `GET /api/attachments/{id}/download`: Pengunduhan berkas lampiran secara aman[cite: 1].
  - `DELETE /api/attachments/{id}`: Penghapusan berkas fisik dari storage dan rekaman dari basis data[cite: 1].
- **Background Jobs (Queue)**:
  - Eksekusi antrean berbasis driver database lokal (`php artisan queue:work`)[cite: 1].
  - Job notifikasi email saat tugas diberikan ke pengguna (`assigned_user_id`)[cite: 1].
  - Job pemrosesan berkas asinkron (pembuatan thumbnail gambar)[cite: 1].

### 2.2 Frontend (Next.js)
- **Autentikasi**:
  - Halaman Login (`/login`) dengan penyimpanan token di cookie/storage dan proteksi rute[cite: 1].
- **Task Dashboard (`/dashboard`)**:
  - Menampilkan daftar tugas (tampilan list atau kanban cards)[cite: 1].
  - Kontrol pencarian, filter status, filter prioritas, dan pengurutan[cite: 1].
  - Modal form pembuatan dan pembaruan tugas[cite: 1].
  - Modal detail tugas yang menampilkan metadata, daftar lampiran, dan riwayat komentar[cite: 1].
- **File Upload Component**:
  - Area drag-and-drop untuk upload berkas lampiran dengan indikator progres[cite: 1].
- **Real-Time Updates**:
  - Menerima event pembaruan status tugas dan komentar baru secara langsung menggunakan Server-Sent Events (SSE) atau WebSocket[cite: 1].

---

## 3. Non-Functional Requirements
- **Validasi Data**: Menggunakan Laravel Form Request untuk validasi input yang ketat pada setiap endpoint.
- **Keamanan**: Password di-hash menggunakan Bcrypt, perlindungan endpoint via middleware autentikasi, sanitasi input untuk mencegah XSS/SQL Injection[cite: 1].
- **Penyimpanan Lokal**: Berkas disimpan pada `storage/app/public` yang dapat diakses lewat symbolic link `public/storage`[cite: 1].
- **Responsif**: Antarmuka Next.js dapat digunakan dengan baik pada perangkat desktop maupun mobile[cite: 1].