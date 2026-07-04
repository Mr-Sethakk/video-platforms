@echo off
chcp 65001 >nul
title 影视平台 - 一键启动全部

echo ========================================
echo   🎬 影视平台全栈 - 一键启动
echo ========================================
echo.

REM ===== 环境变量 =====
set JAVA_HOME=D:\JDK21
set MAVEN_HOME=D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64
set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\mvn\bin;%PATH%

echo [1/5] Docker ...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Desktop 没开！
    pause & exit /b 1
)
docker compose up -d

echo [2/5] MySQL ...
:loop
timeout /t 2 /nobreak >nul
docker compose exec -T mysql mysqladmin ping -h localhost -u root -proot --silent >nul 2>&1 || goto loop
echo      MySQL ✓  Redis ✓

echo [3/5] Spring Boot (新窗口) ...
start "Backend-8080" cmd /c "cd /d %~dp0backend && mvn spring-boot:run"

echo [4/5] 等待后端就绪 ...
:wait_be
timeout /t 2 /nobreak >nul
curl -s -o NUL http://localhost:8080/api/movies?pageSize=1 2>nul || goto wait_be
echo      后端 ✓

echo [5/5] 启动前端 ...
start "Frontend-3000" cmd /c "cd /d %~dp0frontend && npm run dev"

timeout /t 8 /nobreak >nul
echo.
echo ========================================
echo   ✅ 全栈已启动！
echo      前端: http://localhost:3000
echo      后端: http://localhost:8080
echo ========================================
echo.
echo      admin / admin123
echo      user  / user123
echo.
echo 在各自窗口 Ctrl+C 停止服务
pause
