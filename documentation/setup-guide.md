# Setup and Deployment Guide

## System Requirements

- **PHP**: >= 8.2 (Recommended 8.3)
- **Extensions**: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `fileinfo`
- **Node.js**: >= 18.0.0
- **Database**: MySQL 8.0+ or MariaDB 10.4+
- **Composer**: >= 2.5

---

## 1. Quick Start Installation

### Step 1: Clone & Configure Backend

```bash
cd backend

# Install dependencies
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate
php artisan jwt:secret --force
```

Configure MySQL credentials in `backend/.env`:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_management_db
DB_USERNAME=root
DB_PASSWORD=
```

### Step 2: Database Migration & Seeding

```bash
# Create database in MySQL if not present
# mysql -u root -e "CREATE DATABASE IF NOT EXISTS task_management_db;"

# Run migrations and seed sample data
php artisan migrate --force
php artisan db:seed
```

### Step 3: Frontend Installation

```bash
cd ../frontend

# Install dependencies
npm install

# Build check
npm run build
```

---

## 2. Running All 3 Required Services

For full system operation, keep 3 terminals running:

### Terminal 1: Backend API
```bash
cd backend
php artisan serve
# Accessible at http://127.0.0.1:8000
```

### Terminal 2: Queue Worker
```bash
cd backend
php artisan queue:work --tries=3
# Listens for background notifications and thumbnail processing
```

### Terminal 3: Frontend Application
```bash
cd frontend
npm run dev
# Accessible at http://localhost:3000
```

---

## 3. Running Automated Tests

### Backend Unit & Feature Tests
```bash
cd backend

# Setup testing database (task_management_testing)
php artisan test
```

Expected result: 15+ tests passing cleanly against MySQL database.

---

## 4. Default Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `password123` |
| **Member** | `john@example.com` | `password123` |
| **Member** | `sarah@example.com` | `password123` |
| **Admin** | `mike@example.com` | `password123` |
| **Member** | `lisa@example.com` | `password123` |
