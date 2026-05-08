# Spotify Clone Database Setup Script for Windows
# Run this script to set up your Supabase database

Write-Host "🎵 Spotify Clone Database Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if Supabase CLI is installed
try {
    supabase --version | Out-Null
    Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
}

Write-Host ""

# Get project details
$PROJECT_ID = Read-Host "Enter your Supabase project ID"
$ACCESS_TOKEN = Read-Host "Enter your Supabase access token (or press Enter to use local)"

# Migrations directory
$MIGRATIONS_DIR = ".\supabase\migrations"

if (-Not (Test-Path $MIGRATIONS_DIR)) {
    Write-Host "❌ Migrations directory not found: $MIGRATIONS_DIR" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📁 Found migration files:"
Get-ChildItem $MIGRATIONS_DIR -Filter *.sql | Format-Table Name

Write-Host ""
Write-Host "🚀 Applying migration to database..."

if ($ACCESS_TOKEN) {
    supabase db push --project-ref $PROJECT_ID --auth $ACCESS_TOKEN
} else {
    # Try to use local .env
    if (Test-Path ".env.local") {
        # Load environment variables
        Get-Content .env.local | ForEach-Object {
            if ($_ -match '^\s*([^=]+)\s*=\s*(.+)\s*$') {
                $name = $matches[1]
                $value = $matches[2]
                [Environment]::SetEnvironmentVariable($name, $value)
            }
        }
        supabase db push
    } else {
        Write-Host "❌ No access token provided and no .env.local found" -ForegroundColor Red
        Write-Host "Please run: supabase login"
        Write-Host "Then: supabase link --project-ref $PROJECT_ID"
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:"
Write-Host "1. Add sample data (optional):"
Write-Host "   npm run db:seed"
Write-Host ""
Write-Host "2. Start the development server:"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "3. Open http://localhost:3000"
Write-Host ""

pause
