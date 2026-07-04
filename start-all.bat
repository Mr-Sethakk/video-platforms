@echo off
title 影视平台 - 一键启动

echo ========================================
echo   🎬 影视平台全栈 - 一键启动
echo ========================================
echo.

REM ===== 切换到脚本所在目录 =====
cd /d "%~dp0"

REM ===== 环境变量（子窗口也会用到，用 setx 临时设置）=====
set JAVA_HOME=D:\JDK21
set MAVEN_BIN=D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64\mvn\bin
set PATH=%JAVA_HOME%\bin;%MAVEN_BIN%;%PATH%

echo [1/5] Docker ...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Desktop 没开！请先启动 Docker Desktop
    pause
    exit /b 1
)
cd /d "%~dp0"
docker compose up -d

echo [2/5] 等待 MySQL 就绪 ...
:loop
timeout /t 2 /nobreak >nul
cd /d "%~dp0"
docker compose exec -T mysql mysqladmin ping -h localhost -u root -proot --silent >nul 2>&1
if errorlevel 1 goto loop
echo      MySQL OK  Redis OK

echo [3/5] 启动 Spring Boot ...
cd /d "%~dp0backend"
start "Backend-8080" cmd /k "set JAVA_HOME=D:\JDK21&& set PATH=D:\JDK21\bin;D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64\mvn\bin;%PATH%&& cd /d %~dp0backend && mvn spring-boot:run"

echo [4/5] 等待后端就绪（约 15 秒）...
:wait_be
timeout /t 3 /nobreak >nul
curl -s -o NUL http://localhost:8080/api/movies 2>nul
if errorlevel 1 goto wait_be
echo      后端 OK

echo [5/5] 启动前端 ...
cd /d "%~dp0frontend"
start "Frontend-3000" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul
echo.
echo ========================================
echo   ✅ 全栈启动完成！
echo      前端: http://localhost:3000
echo      后端: http://localhost:8080
echo ========================================
echo   admin / admin123
echo   user  / user123
echo.
echo   在后端/前端窗口按 Ctrl+C 停止
pause
