# Database setup script for Employee Management System

# Set environment variables
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_NAME = "employee_management"
$env:DB_USER = "root"
$env:DB_PASSWORD = "employee_management"

# Create the database if it doesn't exist
Write-Host "Creating database $env:DB_NAME..." -ForegroundColor Cyan
$createDbCommand = "mysql -u $env:DB_USER -p$env:DB_PASSWORD -e 'CREATE DATABASE IF NOT EXISTS $env:DB_NAME;'"
Invoke-Expression $createDbCommand

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
node .\_helpers\migrate.js

# Seed the database with initial data (optional)
Write-Host "Seeding database with initial data..." -ForegroundColor Cyan
node .\_helpers\seed.js

Write-Host "Database setup completed successfully!" -ForegroundColor Green
