# System Architecture Document

## Overview

The **Task Management Platform** is designed as a decoupled, multi-tier full-stack application built for high reliability, real-time collaboration, and maintainability.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│             Next.js 16 + React 19 + shadcn/ui               │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP REST (JSON)             │ SSE (Stream)
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                      Backend API Server                     │
│                   Laravel 12 / PHP 8.3                      │
│      ├── JWT Authentication Guard (tymon/jwt-auth)          │
│      ├── Task / Attachment / Comment Controllers            │
│      └── SSE Controller (Server-Sent Events)                │
└──────────────┬──────────────────────────────┬───────────────┘
               │ SQL Queries                  │ Dispatch Jobs
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│        MySQL Database       ││     Background Queue Worker  │
│  - users                    ││   (php artisan queue:work)   │
│  - tasks                    ││  - SendTaskAssignedJob       │
│  - task_attachments         ││  - GenerateThumbnailJob      │
│  - task_comments            │└──────────────────────────────┘
│  - jobs                     │
└─────────────────────────────┘
```

---

## 1. Architecture Decisions

### 1.1 Decoupled Frontend & Backend
- **Backend**: Laravel handles business logic, security policies, database transactions, background processing, and REST APIs.
- **Frontend**: Next.js client application with Tailwind CSS and shadcn/ui component system providing rich interactivity and responsive layouts.

### 1.2 Authentication Strategy (JWT)
- **Stateless Tokens**: Implemented via `tymon/jwt-auth` using standard HS256 HMAC tokens.
- **Cross-Layer Support**:
  - `localStorage` stores the token for client-side API requests via Axios interceptors.
  - An HTTP cookie mirrors the token so that Next.js Edge Middleware can inspect session state without client-side hydration delays.

### 1.3 Real-Time Updates (Server-Sent Events)
- **Pattern**: Server-Sent Events (SSE) via `/api/tasks/events`.
- **Rationale**: SSE provides lightweight, unidirectional streaming over standard HTTP with automatic reconnection, eliminating the operational overhead of running a separate WebSocket cluster for task notification updates.

### 1.4 Background Queue Processing
- **Queue Connection**: Database driver (`jobs` table).
- **Asynchronous Tasks**:
  - Task Assignment Notifications (`SendTaskAssignedNotification`).
  - Image Thumbnail Processing (`GenerateThumbnailJob`).

---

## 2. Database Schema & Entities

### 2.1 Users
| Field | Type | Description |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | Primary Key |
| `name` | VARCHAR(255) | Full name |
| `email` | VARCHAR(255) UNIQUE | User email address |
| `password` | VARCHAR(255) | Bcrypt hashed password |
| `role` | ENUM('admin', 'member') | Role-based access control |
| `created_at` / `updated_at` | TIMESTAMP | Audit timestamps |

### 2.2 Tasks
| Field | Type | Description |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | Primary Key |
| `title` | VARCHAR(255) | Task title |
| `description` | TEXT NULL | Task description |
| `status` | ENUM('pending', 'in_progress', 'completed') | Current task status |
| `priority` | ENUM('low', 'medium', 'high') | Priority level |
| `assigned_user_id` | BIGINT UNSIGNED NULL FK | User assigned to task |
| `created_by` | BIGINT UNSIGNED FK | Task creator |
| `due_date` | DATETIME NULL | Deadline |
| `created_at` / `updated_at` | TIMESTAMP | Audit timestamps |

### 2.3 Task Attachments
| Field | Type | Description |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | Primary Key |
| `task_id` | BIGINT UNSIGNED FK | Associated task |
| `file_name` | VARCHAR(255) | Original file name |
| `file_path` | VARCHAR(255) | Storage path |
| `file_size` | BIGINT UNSIGNED | Size in bytes |
| `mime_type` | VARCHAR(100) | MIME type |
| `uploaded_at` | TIMESTAMP | Upload timestamp |

### 2.4 Task Comments
| Field | Type | Description |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | Primary Key |
| `task_id` | BIGINT UNSIGNED FK | Associated task |
| `user_id` | BIGINT UNSIGNED FK | Author of comment |
| `comment` | TEXT | Comment content |
| `created_at` | TIMESTAMP | Created timestamp |

---

## 3. Security Considerations
- **Password Hashing**: Bcrypt with minimum 12 rounds.
- **File Upload Validation**: Strict validation on file size and permitted MIME types.
- **SQL Injection Prevention**: Eloquent ORM parameterized queries throughout.
- **CORS Protection**: Configured in Laravel with allowed origins for the Next.js client.
