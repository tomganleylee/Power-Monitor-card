# Deploy energy-flow-card.js to Home Assistant
# Usage: .\deploy.ps1

Write-Host "Building energy-flow-card..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful! Deploying to Home Assistant..." -ForegroundColor Green

    # Copy file via SSH
    scp -P 22 dist/energy-flow-card.js root@192.168.3.12:/config/www/energy-flow-card.js

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment successful! Hard refresh your browser (Ctrl+Shift+R)" -ForegroundColor Green
        Write-Host "File deployed to: http://192.168.3.12:8123/local/energy-flow-card.js" -ForegroundColor Yellow
    } else {
        Write-Host "Deployment failed!" -ForegroundColor Red
    }
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}
