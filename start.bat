@echo off
chcp 65001 >nul
title Movie Platform - Start

cd /d "%~dp0"

echo ================================================
echo   Movie Platform - Docker Compose
echo ================================================
echo.

:: Check Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running!
    echo         Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

:: Check .env
if not exist ".env" (
    echo [INFO] .env file not found, creating from .env.example...
    echo         AI features will not work until you configure API keys.
    copy .env.example .env >nul
    echo.
)

echo Starting all services...
docker compose up -d

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start. Check the output above.
    pause
    exit /b 1
)

echo.
echo Waiting for services to be ready...
echo.

:: Wait for backend health
set /a count=0
:wait
timeout /t 3 /nobreak >nul
set /a count+=3
curl -s -o NUL http://localhost:8080/api/movies/genres 2>nul
if not errorlevel 1 goto ready
if %count% lss 120 goto wait

:ready
echo ================================================
echo   All services running!
echo.
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8080
echo   MySQL    : localhost:3306
echo   Redis    : localhost:6379
echo ================================================
echo.
echo   Login: admin / admin123
echo         user  / user123
echo.
echo   Stop: run stop.bat or 'docker compose down'
echo.
pause
