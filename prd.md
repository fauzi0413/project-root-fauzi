# Product Requirement Document (PRD)

## 1. Product Overview
Task Management Platform adalah aplikasi kolaborasi tim yang memungkinkan pengelolaan alur kerja secara terstruktur[cite: 1]. Platform ini memfasilitasi pencatatan tugas, pembagian tanggung jawab ke anggota tim, pelacakan tenggat waktu, pengunggahan dokumen pendukung, dan komunikasi kontekstual melalui komentar secara real-time[cite: 1].

---

## 2. Target Persona & User Flow

### 2.1 User Personas
- **Admin**: Mengelola seluruh tugas proyek, menugaskan pekerjaan kepada anggota tim, dan memantau status penyelesaian[cite: 1].
- **Member**: Melihat tugas yang ditugaskan kepada dirinya, memperbarui status pengerjaan, mengunggah hasil kerja, dan berdiskusi melalui kolom komentar[cite: 1].

### 2.2 User Journey
1. Pengguna masuk menggunakan email dan password melalui halaman Login[cite: 1].
2. Pengguna diarahkan ke Dashboard utama yang menampilkan daftar tugas aktif[cite: 1].
3. Pengguna dapat menyaring tugas berdasarkan status atau mencari tugas tertentu[cite: 1].
4. Pengguna membuka modal detail tugas untuk membaca deskripsi lengkap, mengunggah lampiran dokumen, atau menulis komentar[cite: 1].
5. Anggota tim lain yang membuka tugas yang sama langsung melihat perubahan status atau komentar baru tanpa perlu memuat ulang halaman[cite: 1].

---

## 3. Feature Specifications

### 3.1 Authentication & Profile
- Mendukung autentikasi berbasis JWT token[cite: 1].
- Data profil pengguna aktif dapat diakses via `/api/auth/me` untuk menampilkan identitas pengguna di header aplikasi[cite: 1].

### 3.2 Task Lifecycle & Assignment
- Status tugas memiliki 3 tahap: `pending` -> `in_progress` -> `completed`[cite: 1].
- Tingkat prioritas memiliki 3 level: `low`, `medium`, `high`[cite: 1].
- Saat tugas baru dibuat atau `assigned_user_id` diperbarui, sistem memasukkan job pengiriman notifikasi ke dalam antrean[cite: 1].

### 3.3 File Attachments & Media Handling
- Mendukung lampiran berupa dokumen (PDF, DOCX), gambar (PNG, JPG), dan video (MP4)[cite: 1].
- Untuk berkas gambar, sistem menjalankan background job untuk membuat versi thumbnail berukuran kecil secara otomatis[cite: 1].
- Berkas dapat diunduh kembali secara langsung melalui tautan yang valid[cite: 1].

### 3.4 Live Collaboration (Real-time)
- Menggunakan mekanisme streaming Server-Sent Events (SSE) atau WebSocket sederhana[cite: 1].
- Mengirimkan event saat terjadi:
  - Penambahan tugas baru.
  - Perubahan status tugas[cite: 1].
  - Penambahan komentar baru pada detail tugas[cite: 1].

---

## 4. Acceptance Criteria
- Pengguna tidak dapat mengakses `/dashboard` tanpa memiliki token aktif[cite: 1].
- Paginasi dan penyaringan tugas di backend bekerja sesuai parameter query[cite: 1].
- Berkas lampiran tervalidasi dengan benar sesuai ukuran dan format yang diizinkan[cite: 1].
- Queue worker mampu memproses job pembuatan thumbnail dan notifikasi tanpa menyebabkan error[cite: 1].
- Komentar dan pembaruan status tugas tampil secara real-time pada UI[cite: 1].