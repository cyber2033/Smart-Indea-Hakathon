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

# Step 1: Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[!] ERROR: Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "    Please install Node.js from https://nodejs.org" -ForegroundColor White
    exit 1
}

Write-Host "[+] Node.js is ready." -ForegroundColor Green

# Step 2: Start Backend
Write-Host "[*] Starting Backend Server on http://localhost:5000..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$ScriptDir\backend`" && node src/server.js" -WindowStyle Normal

Start-Sleep -Seconds 2

# Step 3: Start Frontend
Write-Host "[*] Starting Frontend Web App on http://localhost:5173..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$ScriptDir\frontend`" && npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Step 4: Open Browser
Write-Host "[*] Opening Browser at http://localhost:5173..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "[+] SUCCESS: Application is running smoothly!" -ForegroundColor Green
Write-Host "    - Frontend Web App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "    - Backend API:      http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Green
