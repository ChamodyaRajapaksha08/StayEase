@echo off
title StayEase Application Launcher
cd /d "%~dp0"

echo ========================================================
echo   StayEase - Smart Hostel & Apartment Management System
echo   Launching Backend and Frontend concurrently...
echo ========================================================

start "StayEase Backend" cmd /c "run-backend.bat"
timeout /t 6 /nobreak >nul
start "StayEase Frontend" cmd /c "run-frontend.bat"

echo.
echo ========================================================
echo   Services are starting up:
echo     - Backend API:   http://localhost:8080/api
echo     - Frontend Web:  http://localhost:5173
echo ========================================================
echo.
echo Close individual command windows to stop the servers.
pause
