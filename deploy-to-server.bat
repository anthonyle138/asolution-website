@echo off
REM ============================================
REM A'S SOLUTION RAFFLE SYSTEM DEPLOYMENT SCRIPT (Windows)
REM ============================================

echo ==========================================
echo A's Solution Raffle System Deployment
echo ==========================================
echo.

set SERVER_IP=128.199.133.218
set WEB_ROOT=/var/www/html
set API_DIR=%WEB_ROOT%/api

echo Server: %SERVER_IP%
echo Web Root: %WEB_ROOT%
echo.

echo [1/6] Creating API directory...
ssh root@%SERVER_IP% "mkdir -p %API_DIR% && chmod 755 %API_DIR%"
echo [DONE] API directory created
echo.

echo [2/6] Uploading API files...
scp api\*.php root@%SERVER_IP%:%API_DIR%/
scp api\setup-database.sql root@%SERVER_IP%:%API_DIR%/
scp api\README.md root@%SERVER_IP%:%API_DIR%/
echo [DONE] API files uploaded
echo.

echo [3/6] Setting file permissions...
ssh root@%SERVER_IP% "chmod 644 %API_DIR%/*.php && chmod 644 %API_DIR%/setup-database.sql"
echo [DONE] Permissions set
echo.

echo [4/6] Checking MySQL installation...
ssh root@%SERVER_IP% "which mysql"
if %ERRORLEVEL% EQU 0 (
    echo [DONE] MySQL is installed
) else (
    echo [WARNING] MySQL not found
    echo Please install MySQL manually on the server:
    echo   apt-get update ^&^& apt-get install -y mysql-server
)
echo.

echo [5/6] Creating database...
echo Please run this command on your server manually:
echo   ssh root@%SERVER_IP%
echo   mysql -u root -p ^< %API_DIR%/setup-database.sql
echo.

echo [6/6] Testing API...
curl -s -o NUL -w "%%{http_code}" http://%SERVER_IP%/api/settings.php
echo.

echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. SSH to server: ssh root@%SERVER_IP%
echo 2. Create database: mysql -u root -p ^< /var/www/html/api/setup-database.sql
echo 3. Update config: nano /var/www/html/api/config.php
echo 4. Test API: curl http://%SERVER_IP%/api/settings.php
echo 5. Visit: https://anthonyle138.github.io/asolution-website/raffle-admin.html
echo ==========================================

pause
