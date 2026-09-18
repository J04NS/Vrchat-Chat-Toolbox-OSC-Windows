@echo off
setlocal enabledelayedexpansion
title VRChat OSC Chatbox Hub (Windows Dev Mode)

cd /d "%~dp0"

echo ======================================================
echo   VRChat OSC Chatbox Hub (Windows Dev Mode)
echo   Target: VRChat OSC at 127.0.0.1:9000 (UDP)
echo ======================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
)

echo Starting in development mode with tsx...
start http://localhost:3000
call npm run dev

pause
