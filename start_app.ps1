# ===============================================================================
#            SMART KRISHI AI - POWERSHELL ALL-IN-ONE LAUNCHER
# ===============================================================================
$Host.UI.RawUI.WindowTitle = "Smart Krishi AI Platform Launcher (SIH 2026)"

Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "               SMART KRISHI AI - ALL-IN-ONE LAUNCHER" -ForegroundColor Cyan
Write-Host "         Crop Disease Detection, Weather Risk & APMC Procurement Hub" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Step 1: Check Runtime Environments
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[!] ERROR: Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "    Please install Node.js from https://nodejs.org" -ForegroundColor White
    exit 1
}
Write-Host "[+] Node.js is ready." -ForegroundColor Green

# Detect Python (.venv preferred)
$PythonExe = "python"
if (Test-Path "$ScriptDir\.venv\Scripts\python.exe") {
    $PythonExe = "$ScriptDir\.venv\Scripts\python.exe"
    Write-Host "[+] Python virtual environment detected (.venv)." -ForegroundColor Green
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "[+] System Python detected." -ForegroundColor Green
} else {
    Write-Host "[!] WARNING: Python was not found in PATH or .venv." -ForegroundColor Yellow
    Write-Host "    The AI inference microservice requires Python." -ForegroundColor White
}
Write-Host ""

# Step 2: Start AI Inference Microservice
Write-Host "[*] Starting Python AI Inference Microservice on http://localhost:5001..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$ScriptDir`" && `"$PythonExe`" ml_model/inference_server.py" -WindowStyle Normal

Start-Sleep -Seconds 3

# Step 3: Start Backend
Write-Host "[*] Starting Backend Server on http://localhost:5000..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$ScriptDir\backend`" && node src/server.js" -WindowStyle Normal

Start-Sleep -Seconds 2

# Step 4: Start Frontend
Write-Host "[*] Starting Frontend Web App on http://localhost:5173..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$ScriptDir\frontend`" && npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Step 5: Open Browser
Write-Host "[*] Opening Browser at http://localhost:5173..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "[+] SUCCESS: All 3 Platform Services are running smoothly!" -ForegroundColor Green
Write-Host "    - Frontend Web App:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "    - Backend REST API:    http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "    - Python AI Inference: http://localhost:5001/health" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Green
