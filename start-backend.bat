@echo off
chcp 65001 >nul
title 影视平台 - 启动脚本

echo ========================================
echo   🎬 影视平台 - 一键启动
echo ========================================
echo.

REM ===== 环境变量 =====
set JAVA_HOME=D:\JDK21
set MAVEN_HOME=D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64
set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\mvn\bin;%PATH%

echo [1/4] 检查 Docker ...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未启动！请先打开 Docker Desktop
    pause
    exit /b 1
)

echo [2/4] 启动 MySQL + Redis ...
docker compose up -d

echo [3/4] 等待 MySQL 就绪 ...
:wait_mysql
timeout /t 2 /nobreak >nul
docker compose exec -T mysql mysqladmin ping -h localhost -u root -proot --silent >nul 2>&1
if errorlevel 1 goto wait_mysql
echo      MySQL ✓  Redis ✓

echo [4/4] 启动 Spring Boot 后端 ...
start "Backend" cmd /c "cd /d %~dp0backend && mvn spring-boot:run"

echo     后端启动中...（新窗口，约 8 秒就绪）
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo    ✅ 后端: http://localhost:8080
echo    ✅ 前端: http://localhost:3000
echo ========================================
echo.
echo 在后端窗口 Ctrl+C 停止，此窗口可关闭
pause
