@echo off
title Movie Platform - Backend

set "JAVA_HOME=D:\JDK21"
set "MVN_HOME=D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64"
set "PATH=%JAVA_HOME%\bin;%MVN_HOME%\mvn\bin;%PATH%"

cd /d "%~dp0"

:: Clean old Java process occupying port 8080
echo Cleaning old backend process...
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
mvn spring-boot:run
pause
