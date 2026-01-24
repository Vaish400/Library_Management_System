@echo off
echo ========================================
echo Library Management System - Database Setup
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
set SCHEMA_FILE=%SCRIPT_DIR%database\schema.sql

echo Checking if MySQL is in PATH...
where mysql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: MySQL is not in your PATH!
    echo.
    echo Please either:
    echo 1. Add MySQL bin directory to your PATH, OR
    echo 2. Run MySQL manually and execute: source %SCHEMA_FILE%
    echo.
    echo To add MySQL to PATH:
    echo - Find your MySQL installation (usually C:\Program Files\MySQL\MySQL Server 8.0\bin)
    echo - Add it to System Environment Variables
    echo.
    pause
    exit /b 1
)

echo MySQL found!
echo.
echo This will create the library_db database and all tables.
echo You will be prompted for your MySQL root password.
echo.
pause

echo.
echo Executing schema.sql...
mysql -u root -p < "%SCHEMA_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database setup completed!
    echo ========================================
    echo.
    echo You can now start your server:
    echo   cd server
    echo   npm start
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Database setup failed!
    echo ========================================
    echo.
    echo Please check:
    echo - MySQL is running
    echo - Root password is correct
    echo - You have CREATE DATABASE privileges
    echo.
)

pause
