# Set execution policy for the current process
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue

# Install test dependencies if needed
Write-Host "Installing test dependencies..." -ForegroundColor Cyan
& npm install --save-dev jest supertest cross-env

# Set NODE_ENV for testing
$env:NODE_ENV = 'test'

# Run the tests with increased timeout
Write-Host "`nRunning tests..." -ForegroundColor Cyan
& npx jest --config=jest.config.js --detectOpenHandles --forceExit

# Check the exit code and display appropriate message
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some tests failed. Exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
