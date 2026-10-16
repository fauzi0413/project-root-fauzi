#!/bin/bash
# Create testing database for Laravel tests
# Usage: bash setup-test-db.sh

# MySQL connection details
MYSQL_USER="root"
MYSQL_PASS=""
MYSQL_HOST="127.0.0.1"
TEST_DB="task_management_testing"

echo "Creating test database: $TEST_DB"

mysql -h $MYSQL_HOST -u $MYSQL_USER -p"$MYSQL_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS $TEST_DB;
GRANT ALL PRIVILEGES ON $TEST_DB.* TO '$MYSQL_USER'@'$MYSQL_HOST';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo "✓ Test database created successfully"
else
    echo "✗ Failed to create test database"
    exit 1
fi
