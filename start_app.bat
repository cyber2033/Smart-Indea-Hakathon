@echo off
TITLE Smart Krishi AI Platform Launcher (SIH 2026)
COLOR 0A

echo ===============================================================================
echo                SMART KRISHI AI - ALL-IN-ONE LAUNCHER
echo          Crop Disease Detection, Weather Risk & APMC Procurement Hub
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [*] Step 1: Checking runtime environments...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ERROR: Node.js is not installed or not in PATH!
    echo     Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo [✓] Node.js is ready.

rem Detect Python executable (.venv preferred)
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
    echo [✓] Python detected in .venv virtual environment.
) else (
    where python >nul 2>nul
    if %errorlevel% neq 0 (
        echo [!] WARNING: Python not found in PATH or .venv!
        echo     AI inference microservice requires Python 3.10+.
    ) else (
        set "PYTHON_EXE=python"
        echo [✓] System Python detected.
    )
)
echo.

echo [*] Step 2: Starting AI Crop Disease Inference Microservice on http://localhost:5001...
start "SIH Krishi AI Inference Microservice" cmd /k "cd /d "%~dp0" && "%PYTHON_EXE%" ml_model/inference_server.py"

timeout /t 3 /nobreak >nul

echo [*] Step 3: Starting Backend Server on http://localhost:5000...
start "SIH Krishi Backend" cmd /k "cd /d "%~dp0backend" && node src/server.js"

timeout /t 2 /nobreak >nul

echo [*] Step 4: Starting Frontend Web App on http://localhost:5173...
start "SIH Krishi Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [*] Step 5: Opening Browser...
start http://localhost:5173

echo.
echo ===============================================================================
echo [✓] SUCCESS: All 3 Platform Services are Running!
echo     - Frontend Web App:     http://localhost:5173
echo     - Backend REST API:     http://localhost:5000/api/health
echo     - Python AI Inference:  http://localhost:5001/health
echo ===============================================================================
echo.
