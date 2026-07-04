@echo off
title Movie Platform - Start All

:: ===== SETUP =====
set "JAVA_HOME=D:\JDK21"
set "MVN_HOME=D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64"
set "PATH=%JAVA_HOME%\bin;%MVN_HOME%\mvn\bin;%PATH%"

cd /d "%~dp0"

:: Load environment variables from .env file
if exist "%~dp0backend\.env" (
    for /f "usebackq tokens=1,2 delims==" %%a in ("%~dp0backend\.env") do (
        set "%%a=%%b"
    )
)

echo ================================================
echo   Movie Platform - Start All Services
echo ================================================
echo.

:: ===== Clean old processes =====
echo [0/5] Cleaning old processes...
taskkill /F /IM java.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo        Clean

:: ===== Docker =====
echo [1/5] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Docker Desktop is not running!
    pause
    exit /b 1
)
docker compose up -d
echo        Docker: MySQL + Redis started

:: ===== Wait for MySQL =====
echo [2/5] Waiting for MySQL...
:wait_mysql
timeout /t 2 /nobreak >nul
docker compose exec -T mysql mysqladmin ping -h localhost -u root -proot --silent >nul 2>&1
if errorlevel 1 goto wait_mysql
echo        MySQL ready

:: ===== Backend =====
echo [3/5] Starting Spring Boot (port 8080)...
start "Backend-8080" cmd /k "set JAVA_HOME=D:\JDK21&& set PATH=D:\JDK21\bin;D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64\mvn\bin;%PATH%&& set DEEPSEEK_API_KEY=%DEEPSEEK_API_KEY%&& cd /d %~dp0backend&& mvn spring-boot:run -Dspring-boot.run.jvmArguments=-DDEEPSEEK_API_KEY=%DEEPSEEK_API_KEY%"

:: ===== Wait for Backend =====
echo        Waiting for backend to be ready...
:wait_backend
timeout /t 3 /nobreak >nul
curl -s -o NUL http://localhost:8080/api/movies 2>nul
if errorlevel 1 goto wait_backend
echo        Backend ready

:: ===== Frontend =====
echo [4/5] Starting Frontend (port 3000)...
start "Frontend-3000" cmd /k "cd /d %~dp0frontend&& npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ================================================
echo   ALL SERVICES RUNNING
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8080
echo ================================================
echo.
echo   Login: admin / admin123
echo         user  / user123
echo.
echo   Press Ctrl+C in each window to stop.
pause
