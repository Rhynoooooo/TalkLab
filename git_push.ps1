$git = "$env:LOCALAPPDATA\Programs\MinGit\cmd\git.exe"

Write-Host "Configuring Git branch and remote..."
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

Write-Host "Staging files..."
& $git add .

Write-Host "Committing files..."
& $git commit -m "Update TalkLab website: Arabic Cairo typography, floating mini disc music player, arcade touch fixes, and boardroom table row alignment"

Write-Host "Git status:"
& $git status

Write-Host "Attempting push to origin main..."
& $git push -u origin main
