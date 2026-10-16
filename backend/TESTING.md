# Testing Setup Guide

## Problem
SQLite driver (`pdo_sqlite`) not available in local environment. Solution: Switch to MySQL for testing.

## Solution Overview

Testing now uses MySQL with a separate **`task_management_testing`** database to keep test data isolated from production (`task_management_db`).

### Changes Made

1. **phpunit.xml** - Updated to MySQL with test database config
2. **TaskApiTest.php** - Already uses `RefreshDatabase` trait for safe test isolation
3. **Setup Scripts** - Automated database creation

---

## Setup Instructions

### Step 1: Create Test Database

Choose your operating system:

#### Windows (Git Bash or Command Prompt)

```bash
# From backend directory
bash setup-test-db.sh

# OR using batch file
setup-test-db.bat

# OR manual MySQL command
mysql -u root -h 127.0.0.1
```

```sql
CREATE DATABASE IF NOT EXISTS task_management_testing;
GRANT ALL PRIVILEGES ON task_management_testing.* TO 'root'@'127.0.0.1';
FLUSH PRIVILEGES;
```

#### Linux / macOS

```bash
# From backend directory
bash setup-test-db.sh
```

### Step 2: Run Tests

```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/TaskApiTest.php

# Run with verbose output
php artisan test tests/Feature/TaskApiTest.php -v

# Run with coverage report
php artisan test --coverage
```

---

## How It Works

### Database Isolation

- **RefreshDatabase trait** in TaskApiTest automatically:
  - Begins transaction before each test
  - Rolls back transaction after test completes
  - Leaves no data behind
  - Each test starts with clean database

### Configuration

**phpunit.xml** environment variables:
```xml
<env name="DB_CONNECTION" value="mysql"/>
<env name="DB_HOST" value="127.0.0.1"/>
<env name="DB_PORT" value="3306"/>
<env name="DB_DATABASE" value="task_management_testing"/>
<env name="DB_USERNAME" value="root"/>
<env name="DB_PASSWORD" value=""/>
```

**Key Points:**
- Test DB name: `task_management_testing`
- Separate from production `task_management_db`
- Data automatically rolled back after each test
- Safe to run tests repeatedly without data cleanup

---

## Troubleshooting

### "MySQL server has gone away"

Ensure MySQL is running:
```bash
# Check if MySQL is running
mysql -u root -h 127.0.0.1 -e "SELECT 1;"

# If using Laragon, start from Laragon GUI
# If using Docker: docker-compose up -d
```

### "Access denied for user 'root'"

Update `.env` password to match your MySQL password:
```
DB_PASSWORD=your_password
```

Also update `phpunit.xml`:
```xml
<env name="DB_PASSWORD" value="your_password"/>
```

### "Database does not exist"

Manually create it:
```sql
CREATE DATABASE task_management_testing;
```

Or run setup script again.

### Tests still timeout/hang

Kill any stuck MySQL connections:
```bash
# Check active connections
mysql -u root -e "SHOW PROCESSLIST;"

# Kill specific connection
mysql -u root -e "KILL CONNECTION_ID;"
```

Then run tests again.

---

## Test Coverage

TaskApiTest.php includes 26 tests:

| Category | Tests |
|----------|-------|
| Authentication | 5 (login valid/invalid, me, logout, unauthorized) |
| Task CRUD | 7 (list, filter, search, create, read, update, delete) |
| Attachments | 4 (upload valid, invalid type, oversized, delete) |
| Comments | 3 (list, add, empty validation) |
| Authorization | 2 (no token, invalid token) |
| **Total** | **26 tests** |

---

## Quick Start (One Command)

```bash
cd backend

# Create test DB + Run tests
bash setup-test-db.sh && php artisan test tests/Feature/TaskApiTest.php
```

---

## Notes

- Do NOT use production database for testing
- Test database `task_management_testing` is safe to delete/recreate
- Each test is independent and automatically cleaned up
- Database credentials must match your local MySQL setup
