@echo off
title TalkLab - Local Server & Cloudflare Tunnel
echo ========================================================
echo   TalkLab: Starting Local Server + Cloudflare Tunnel
echo ========================================================
echo.

powershell -Command "Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue"

start /b powershell.exe -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080

echo Server started on port 8080!
echo Starting Cloudflare Tunnel...
echo.
"%~dp0cloudflared.exe" tunnel --url http://localhost:8080
pause
