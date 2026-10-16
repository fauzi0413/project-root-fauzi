# Task Management System

Full-stack task management platform with PHP Laravel backend, Next.js frontend, real-time updates, and file attachment support.

## Tech Stack

- **Backend**: PHP 8.2+, Laravel 11, MySQL
- **Frontend**: Next.js 14+, React, TypeScript
- **Queue**: Laravel Queue (Database driver)
- **Auth**: JWT (Tymon\JwtAuth)
- **Real-time**: Server-Sent Events (SSE)

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn
- MySQL 5.7+
- Windows, macOS, or Linux

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed database with demo data
php artisan db:seed
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
```

### 3. Database Setup

Ensure MySQL is running and database exists:

```bash
# Create database (via MySQL client)
CREATE DATABASE task_management_db;
```

Or use Laragon/XAMPP/Docker to manage MySQL locally.

## Running Services

**Important**: All three services must run simultaneously for full functionality.

### Terminal 1: Backend API Server

```bash
cd backend
php artisan serve
```

Server runs on `http://localhost:8000`

### Terminal 2: Queue Worker (Background Jobs)

```bash
cd backend
php artisan queue:work
```

Processes background tasks like notifications and thumbnail generation.

### Terminal 3: Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

## Default Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `password123` | admin |
| `john@example.com` | `password123` | member |
| `sarah@example.com` | `password123` | member |
| `mike@example.com` | `password123` | admin |
| `lisa@example.com` | `password123` | member |

## Features

### Authentication
- JWT token-based authentication
- Login/logout endpoints
- User profile retrieval
- Role-based access control (admin/member)

### Task Management
- Create, read, update, delete tasks
- Filter by status (pending, in_progress, completed)
- Filter by priority (low, medium, high)
- Search by title
- Sort by created_at, due_date, or priority
- Pagination support (default 10 items per page)

### Attachments
- Upload files (images, documents, videos)
- Max file size: 25MB
- Automatic thumbnail generation for images
- Download and delete attachments
- File storage in `storage/app/public/attachments`

### Comments
- Add comments to tasks
- View comment history
- Real-time comment updates

### Real-Time Updates
- Server-Sent Events (SSE) for live task updates
- Automatic UI refresh when tasks change
- Real-time comment notifications

### Background Jobs
- SendTaskAssignedNotification: Simulates email notification when task assigned
- GenerateThumbnailJob: Creates thumbnails for image attachments

## API Documentation

Complete API collection available in Postman JSON format:

```
documentation/api-docs/task_api_collection.json
```

### Import into Postman

1. Open Postman
2. Click "Import"
3. Select `documentation/api-docs/task_api_collection.json`
4. Collection imports with all endpoints and variables
5. Set `auth_token` and `task_id` variables in Environment after login

### Key Endpoints

**Auth**
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout and invalidate token

**Tasks**
- `GET /api/tasks` - List tasks (with pagination, filter, search, sort)
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task detail
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**Attachments**
- `POST /api/tasks/{id}/attachments` - Upload file
- `GET /api/attachments/{id}/download` - Download file
- `DELETE /api/attachments/{id}` - Delete file

**Comments**
- `GET /api/tasks/{id}/comments` - List comments
- `POST /api/tasks/{id}/comments` - Add comment

**Real-time**
- `GET /api/tasks/events` - SSE event stream

## Testing

Run PHPUnit feature tests:

```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/TaskApiTest.php

# Run with coverage
php artisan test --coverage
```

Tests include:
- Authentication (login success/failure)
- Task CRUD operations
- Filtering and pagination
- File upload validation
- Comment management
- Authorization checks

## File Structure

```
project-root/
├── backend/                      # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/    # API controllers
│   │   ├── Models/              # Eloquent models
│   │   ├── Jobs/                # Queue jobs
│   │   └── Requests/            # Form requests (validation)
│   ├── database/
│   │   ├── migrations/          # Database migrations
│   │   └── seeders/             # Database seeders
│   ├── routes/
│   │   └── api.php              # API routes
│   ├── tests/
│   │   └── Feature/             # Feature tests
│   ├── storage/
│   │   └── app/public/          # File storage
│   ├── .env                     # Environment variables
│   └── phpunit.xml              # PHPUnit config
│
├── frontend/                    # Next.js UI
│   ├── src/
│   │   ├── app/                 # Routes and layouts
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilities and API client
│   │   └── styles/              # Global styles
│   ├── package.json
│   └── next.config.js
│
└── documentation/
    └── api-docs/
        └── task_api_collection.json
```

## Database Schema

- **users**: id, name, email, password, role, timestamps
- **tasks**: id, title, description, status, priority, assigned_user_id, created_by, due_date, timestamps
- **task_attachments**: id, task_id, file_name, file_path, file_size, mime_type, uploaded_at
- **task_comments**: id, task_id, user_id, comment, timestamps

## Environment Variables

Backend (`.env`):
```
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_management_db
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database
JWT_SECRET=<generated-on-install>
```

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Troubleshooting

### "SQLSTATE[HY000]: General error: 1030"
- Clear cache: `php artisan cache:clear`
- Clear config: `php artisan config:clear`

### Queue not processing jobs
- Ensure `QUEUE_CONNECTION=database` in backend `.env`
- Run `php artisan queue:work` in separate terminal
- Check `jobs` table in database

### CORS errors on frontend
- Verify `APP_URL` in backend `.env`
- Check frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`

### File upload fails
- Check `storage/app/public` directory exists and is writable
- Run `php artisan storage:link` if not created
- Verify `FILESYSTEM_DISK=local` in `.env`

## Submission Checklist

- [ ] All services running (backend, queue, frontend)
- [ ] Login works with provided credentials
- [ ] Tasks can be created, filtered, and deleted
- [ ] Files can be uploaded and downloaded
- [ ] Comments display in real-time
- [ ] Tests pass: `php artisan test`
- [ ] Database dump exported: `mysqldump -u root task_management_db > database.sql`
- [ ] Git commits up-to-date with meaningful messages
- [ ] Demo recording (optional): Shows 1-2 min walkthrough

## License

MIT License
