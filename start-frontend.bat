@echo off
chcp 65001 >nul
title 影视平台 - 前端

cd /d "%~dp0frontend"
echo 🎬 启动前端 http://localhost:3000 ...
npm run dev
pause
