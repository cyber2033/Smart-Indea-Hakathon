@echo off
TITLE Smart Krishi AI Platform Launcher (SIH 2026)
COLOR 0A

echo ===============================================================================
echo                SMART KRISHI AI - ALL-IN-ONE LAUNCHER
echo          Crop Disease Detection, Weather Risk & APMC Procurement Hub
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [*] Step 1: Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ERROR: Node.js is not installed or not in PATH!
    echo     Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [✓] Node.js is ready.
echo.

echo [*] Step 2: Starting Backend Server on http://localhost:5000...
start "SIH Krishi Backend" cmd /k "cd /d "%~dp0backend" && node src/server.js"

timeout /t 2 /nobreak >nul

echo [*] Step 3: Starting Frontend Web App on http://localhost:5173...
start "SIH Krishi Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [*] Step 4: Opening Browser...
start http://localhost:5173

echo.
echo ===============================================================================
echo [✓] SUCCESS: Application is running!
echo     - Frontend Web App: http://localhost:5173
echo     - Backend API:      http://localhost:5000/api/health
echo ===============================================================================
echo.
