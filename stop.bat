@echo off
chcp 65001 >nul
title Movie Platform - Stop

cd /d "%~dp0"

echo ================================================
echo   Movie Platform - Stop
echo ================================================
echo.

echo Stopping all services...
docker compose down

if errorlevel 1 (
    echo.
    echo [WARN] Some services may not have stopped cleanly.
    echo        Try 'docker compose down -v' to also reset the database.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   All services stopped.
echo.
echo   To reset everything (including database):
echo     docker compose down -v
echo ================================================
echo.
timeout /t 3 /nobreak >nul
