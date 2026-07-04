@echo off
title Movie Platform - Stop All

echo ================================================
echo   Movie Platform - Stop All Services
echo ================================================
echo.

echo [1/3] Stopping Spring Boot (Java)...
taskkill /F /IM java.exe >nul 2>&1
if errorlevel 1 (
    echo        No Java process found
) else (
    echo        Java stopped
)

echo [2/3] Stopping Frontend (Node.js)...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo        No Node.js process found
) else (
    echo        Node.js stopped
)

echo [3/3] Stopping Docker containers...
cd /d "%~dp0"
docker compose stop 2>&1
if errorlevel 1 (
    echo        Docker not running or compose failed
) else (
    echo        MySQL + Redis stopped
)

echo.
echo ================================================
echo   All services stopped.
echo ================================================
echo.
timeout /t 3 /nobreak >nul
