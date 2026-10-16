@echo off
REM Create testing database for Laravel tests on Windows
REM Usage: setup-test-db.bat

setlocal enabledelayedexpansion

set MYSQL_HOST=127.0.0.1
set MYSQL_USER=root
set MYSQL_PASS=
set TEST_DB=task_management_testing

echo Creating test database: %TEST_DB%

mysql -h %MYSQL_HOST% -u %MYSQL_USER% -p%MYSQL_PASS% ^
CREATE DATABASE IF NOT EXISTS %TEST_DB%; ^
GRANT ALL PRIVILEGES ON %TEST_DB%.* TO '%MYSQL_USER%'^@'%MYSQL_HOST%'; ^
FLUSH PRIVILEGES;

if %errorlevel% equ 0 (
    echo.
    echo ^ Test database created successfully
) else (
    echo.
    echo X Failed to create test database
    pause
    exit /b 1
)

endlocal
