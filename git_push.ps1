$env:PATH = "$env:LOCALAPPDATA\Programs\MinGit\cmd;$env:LOCALAPPDATA\Programs\MinGit\mingw64\bin;$env:PATH"
$git = "$env:LOCALAPPDATA\Programs\MinGit\cmd\git.exe"

Write-Host "Configuring Git branch and remote..." -ForegroundColor Cyan
& $git branch -M main

$remotes = & $git remote
if ($remotes -contains "origin") {
    & $git remote set-url origin https://github.com/Rhynoooooo/TalkLab.git
} else {
    & $git remote add origin https://github.com/Rhynoooooo/TalkLab.git
}

$user = & $git config user.name
if (-not $user) {
    & $git config user.name "Rhynoooooo"
    & $git config user.email "Rhynoooooo@users.noreply.github.com"
}

Write-Host "Staging files..." -ForegroundColor Cyan
& $git add .

Write-Host "Checking status..." -ForegroundColor Cyan
$status = & $git status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Cyan
    & $git commit -m "Update TalkLab website and deployment configurations"
} else {
    Write-Host "Working tree is clean, ready to push." -ForegroundColor Green
}

Write-Host "`nAttempting push to https://github.com/Rhynoooooo/TalkLab.git (branch main)..." -ForegroundColor Yellow
Write-Host "If prompted, sign in via your browser to authorize GitHub access.`n" -ForegroundColor Yellow

& $git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Everything was pushed to GitHub successfully! " -ForegroundColor Green
    Write-Host " URL: https://github.com/Rhynoooooo/TalkLab             " -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[!] Push did not complete. If authentication was needed, please complete the login prompt or provide a Personal Access Token." -ForegroundColor Red
}
