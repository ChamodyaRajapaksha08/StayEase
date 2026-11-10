@echo off
set "DB_URL=jdbc:mysql://localhost:3306/stayease_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
set "DB_USERNAME=root"
set "DB_PASSWORD=123456"
set "JWT_SECRET=kJ8dP2xQ9mZ4vR7tY1wN6bC3hF5gL0sA8eU2iO"
set "ADMIN_EMAIL=chamodyarajapaksha088@gmail.com"
set "ADMIN_PASSWORD=CHamo832002"
call run-backend.bat