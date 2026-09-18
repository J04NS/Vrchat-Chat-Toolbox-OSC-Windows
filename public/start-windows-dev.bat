@echo off
setlocal enabledelayedexpansion
title VRChat OSC Chatbox Hub (Windows Dev Mode)

cd /d "%~dp0"

echo ======================================================
echo   VRChat OSC Chatbox Hub - Development Mode (Dev)
echo ======================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

if not exist node_modules (
    echo [INFO] Installing dependencies (npm install --legacy-peer-deps)...
    call npm install --legacy-peer-deps
)

echo.
echo [OK] Launching VRChat OSC Hub (Live Dev)...
start http://localhost:3000
call npm run dev
pause
