# PowerShell script to push Energy Flow Card to GitHub
# Run this from the energy-flow-card directory

Write-Host "🚀 Energy Flow Card - GitHub Push Script" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the energy-flow-card directory" -ForegroundColor Red
    exit 1
}

# Check if dist exists
if (-not (Test-Path "dist/energy-flow-card.js")) {
    Write-Host "⚠️  Warning: dist/energy-flow-card.js not found. Building..." -ForegroundColor Yellow
    npm run build
}

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "📝 Initializing git repository..." -ForegroundColor Green
    git init
}

# Check if remote exists
$remoteExists = git remote | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "📝 Adding remote origin..." -ForegroundColor Green
    git remote add origin https://github.com/tomganleylee/Power-Monitor-card.git
} else {
    Write-Host "✅ Remote origin already exists" -ForegroundColor Green
}

# Check status
Write-Host ""
Write-Host "📊 Current git status:" -ForegroundColor Cyan
git status

# Confirm with user
Write-Host ""
$confirm = Read-Host "Do you want to commit and push all changes? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Cancelled" -ForegroundColor Yellow
    exit 0
}

# Add all files
Write-Host ""
Write-Host "📝 Adding files..." -ForegroundColor Green
git add .

# Commit
$commitMessage = @"
Initial commit: Energy Flow Card v1.0.0

- Beautiful animated energy flow visualization
- Particle and Sankey visualization modes
- Hierarchical device categories
- Circuit tracking with remainder calculation
- Battery time remaining calculation
- Customizable themes and warnings
- Comprehensive documentation and examples
"@

Write-Host "📝 Committing changes..." -ForegroundColor Green
git commit -m $commitMessage

# Push
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Green
Write-Host ""

# Try main branch first
$pushed = $false
try {
    git push -u origin main 2>&1 | Out-Null
    $pushed = $true
    Write-Host "✅ Successfully pushed to main branch!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Main branch push failed, trying master..." -ForegroundColor Yellow
}

# If main failed, try master
if (-not $pushed) {
    try {
        git branch -M main
        git push -u origin main --force
        Write-Host "✅ Successfully pushed to main branch!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Push failed. You may need to authenticate." -ForegroundColor Red
        Write-Host "Try running: git push -u origin main" -ForegroundColor Yellow
        exit 1
    }
}

# Success!
Write-Host ""
Write-Host "🎉 Success! Your repository is now on GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. 📸 Add screenshots to docs/images/" -ForegroundColor White
Write-Host "2. 🏷️  Create a release: git tag -a v1.0.0 -m 'Release v1.0.0'" -ForegroundColor White
Write-Host "3. 🚀 Push the tag: git push origin v1.0.0" -ForegroundColor White
Write-Host "4. 📦 Create a release on GitHub with the dist/energy-flow-card.js file" -ForegroundColor White
Write-Host ""
Write-Host "Repository: https://github.com/tomganleylee/Power-Monitor-card" -ForegroundColor Cyan
