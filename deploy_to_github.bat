@echo off
title TalkLab - Deploy to GitHub Pages
echo ========================================================
echo   TalkLab: Push Website to GitHub (Rhynoooooo/TalkLab)
echo ========================================================
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0git_push.ps1"
echo.
pause
