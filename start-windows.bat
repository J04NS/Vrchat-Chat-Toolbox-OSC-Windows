@echo off
setlocal enabledelayedexpansion
title VRChat OSC Chatbox Hub (Windows)

:: Change to the directory of this batch file
cd /d "%~dp0"

echo ======================================================
echo   VRChat OSC Chatbox Hub (Windows 10 / 11)
echo   Target: VRChat OSC at 127.0.0.1:9000 (UDP)
echo ======================================================
echo.

:: 1. Verify Node.js
where node >nul 2>nul
if errorlevel 1 goto :NO_NODE

:: 2. Verify npm
where npm >nul 2>nul
if errorlevel 1 goto :NO_NPM

echo [1/3] Node.js detected:
node -v
echo.

:: 3. Install dependencies if node_modules is missing
if not exist node_modules goto :INSTALL_DEPS
if not exist node_modules\express goto :INSTALL_DEPS
goto :CHECK_BUILD

:INSTALL_DEPS
echo [2/3] Installing dependencies (npm install --legacy-peer-deps)...
echo       This may take 1-2 minutes on first run...
echo.
call npm install --legacy-peer-deps
if errorlevel 1 goto :NPM_INSTALL_ERROR
echo.

:CHECK_BUILD
:: 4. Check build
if not exist dist\server.cjs goto :DO_BUILD
goto :LAUNCH_APP

:DO_BUILD
echo [3/3] Building production bundle (npm run build)...
echo.
call npm run build
if errorlevel 1 goto :BUILD_ERROR
echo.

:LAUNCH_APP
echo ======================================================
echo [OK] Launching server at http://localhost:3000...
echo      VRChat OSC Ingress listening on UDP 9001 (AFK & movement)
echo      Chatbox output sending to UDP 9000
echo.
echo      Press CTRL + C in this window to stop the server.
echo ======================================================
echo.

start http://localhost:3000
node dist\server.cjs
if errorlevel 1 goto :SERVER_ERROR

echo Server stopped.
pause
exit /b 0

:NO_NODE
echo [ERROR] Node.js was not found on this PC!
echo Please install Node.js from https://nodejs.org/ (LTS recommended).
pause
exit /b 1

:NO_NPM
echo [ERROR] npm was not found in your system PATH!
pause
exit /b 1

:NPM_INSTALL_ERROR
echo [ERROR] npm install failed!
pause
exit /b 1

:BUILD_ERROR
echo [ERROR] npm run build failed!
pause
exit /b 1

:SERVER_ERROR
echo [WARNING] Server exited with an error code!
pause
exit /b 1
