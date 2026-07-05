@echo off
title Movie Platform - Frontend

cd /d "%~dp0frontend"

echo ================================================
echo   Frontend Startup
echo ================================================
echo.

echo [1/2] Stopping old frontend...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/2] Starting Next.js on port 3000...
echo        Backend expected at http://localhost:8080/api
echo        Make sure backend is running first!
echo.
npm run dev
pause
