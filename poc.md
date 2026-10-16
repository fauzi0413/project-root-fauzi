# Proof of Concept (PoC) Blueprint

## 1. Minimal Viable Scope
Target PoC adalah membuktikan integrasi end-to-end antara Next.js dan Laravel secara lokal pada empat alur utama[cite: 1]:
1. Autentikasi pengguna via JWT[cite: 1].
2. CRUD tugas dengan pemfilteran data dari database[cite: 1].
3. Pengunggahan lampiran berkas lokal beserta pembuatan thumbnail[cite: 1].
4. Pembaruan data real-time berbasis Server-Sent Events (SSE)[cite: 1].

---

## 2. API Contract Specification

### 2.1 Authentication
- **Login**: `POST /api/auth/login`
  - Request:
    ```json
    { "email": "admin@example.com", "password": "password123" }
    ```
  - Response (200 OK):
    ```json
    {
      "token": "eyJhbGciOi...",
      "user": { "id": 1, "name": "Admin User", "email": "admin@example.com", "role": "admin" }
    }
    ```

### 2.2 Tasks
- **List Tasks**: `GET /api/tasks?status=pending&priority=high&page=1`
  - Response (200 OK):
    ```json
    {
      "data": [
        {
          "id": 1,
          "title": "Setup Database",
          "description": "Create migrations and seed data",
          "status": "pending",
          "priority": "high",
          "due_date": "2026-11-01",
          "assigned_user": { "id": 2, "name": "Developer" }
        }
      ],
      "current_page": 1,
      "last_page": 2,
      "total": 15
    }
    ```

- **Create Task**: `POST /api/tasks`
  - Request:
    ```json
    {
      "title": "Fix Auth Bug",
      "description": "Resolve JWT refresh issue",
      "status": "pending",
      "priority": "high",
      "assigned_user_id": 2,
      "due_date": "2026-11-05"
    }
    ```

### 2.3 Attachments
- **Upload File**: `POST /api/tasks/{id}/attachments` (Multipart Form Data)
  - Payload: `file: <binary_data>`
  - Response (201 Created):
    ```json
    {
      "id": 1,
      "task_id": 1,
      "file_name": "screenshot.png",
      "file_path": "attachments/screenshot.png",
      "file_size": 240500,
      "mime_type": "image/png"
    }
    ```

---

## 3. Real-Time Streaming Concept (SSE)
Implementasi streaming native Laravel tanpa dependensi websocket server eksternal:
- **Client**: Next.js menggunakan API native `EventSource`.
  ```javascript
  const eventSource = new EventSource('[http://127.0.0.1:8000/api/tasks/events](http://127.0.0.1:8000/api/tasks/events)');
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Mutasi state lokal tanpa fetch ulang seluruh halaman
  };