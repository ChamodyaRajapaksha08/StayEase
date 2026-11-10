@echo off
setlocal
title StayEase Backend Server - Port 8080
cd /d "%~dp0backend"

echo ========================================================
echo   StayEase - Smart Hostel & Apartment Management System
echo   Starting Spring Boot 3 Backend (Java 21)
echo ========================================================

:: Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java 21 is not installed or not in PATH.
    pause
    exit /b 1
)

:: If executable JAR exists, run directly
if exist "target\stayease-backend-1.0.0.jar" (
    echo [INFO] Found stayease-backend-1.0.0.jar. Launching application...
    echo [INFO] Profile: mysql (persistent MySQL database)
    echo [INFO] Required environment variables: DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET
    echo --------------------------------------------------------
    java -jar target\stayease-backend-1.0.0.jar --spring.profiles.active=mysql
) else (
    echo [INFO] JAR not found. Running with Maven Spring Boot Plugin...
    mvn spring-boot:run -Dspring-boot.run.profiles=mysql
)

pause
