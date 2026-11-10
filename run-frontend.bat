@echo off
setlocal
title StayEase Frontend Web App - Port 5173
cd /d "%~dp0frontend"

echo ========================================================
echo   StayEase - Smart Hostel & Apartment Management System
echo   Starting React Vite Frontend Server
echo ========================================================

:: Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

:: Run Vite Dev Server
npm run dev

pause
