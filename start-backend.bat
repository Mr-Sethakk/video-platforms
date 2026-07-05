@echo off
title Movie Platform - Backend

set "JAVA_HOME=D:\JDK21"
set "MVN_HOME=D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64"
set "PATH=%JAVA_HOME%\bin;%MVN_HOME%\mvn\bin;%PATH%"

cd /d "%~dp0"

:: Read API key from .env
set "DK="
for /f "usebackq tokens=1,2 delims==" %%a in ("%~dp0backend\.env") do (
    if "%%a"=="DEEPSEEK_API_KEY" set "DK=%%b"
)

:: Clean old Java
echo Cleaning old backend...
taskkill /F /IM java.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo Starting MySQL + Redis...
docker compose up -d

echo Waiting for MySQL...
:wait_mysql
timeout /t 2 /nobreak >nul
docker compose exec -T mysql mysqladmin ping -h localhost -u root -proot --silent >nul 2>&1
if errorlevel 1 goto wait_mysql

echo Starting Spring Boot on port 8080...
cd backend
if defined DK (
    mvn spring-boot:run "-Dspring-boot.run.jvmArguments=-DDEEPSEEK_API_KEY=%DK%"
) else (
    echo [WARN] No DEEPSEEK_API_KEY found — AI chat will not work
    mvn spring-boot:run
)
pause
