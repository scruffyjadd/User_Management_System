# Set execution policy for the current process
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Install development dependencies
Write-Host "Installing development dependencies..." -ForegroundColor Cyan
npm install --save-dev cross-env

# Install runtime dependencies
Write-Host "Installing runtime dependencies..." -ForegroundColor Cyan
npm install express-rate-limit

Write-Host "`nDependencies installed successfully!" -ForegroundColor Green
