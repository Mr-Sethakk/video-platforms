@echo off
title Movie Platform - Frontend

cd /d "%~dp0frontend"

echo Starting Next.js on port 3000...
npm run dev
pause
