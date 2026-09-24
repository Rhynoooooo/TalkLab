@echo off
title TalkLab - 1-Click Cloud Redeploy
echo ========================================================
echo   TalkLab: Packaging & Deploying to Global 24/7 Cloud
echo ========================================================
echo.

if exist "%~dp0talklab_site.zip" del /f /q "%~dp0talklab_site.zip"

echo Compressing website files...
tar.exe -a -c -f "%~dp0talklab_site.zip" index.html styles js assets

echo.
echo Uploading to 24/7 Global CDN...
"C:\Windows\System32\curl.exe" -sS -X POST "https://ship.page/deploy" -H "Content-Type: application/zip" --data-binary "@%~dp0talklab_site.zip"

echo.
echo ========================================================
echo   Deployment Complete! Your site is live 24/7.
echo ========================================================
pause
