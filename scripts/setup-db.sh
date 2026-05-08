#!/bin/bash

# Spotify Clone Database Setup Script
# Run this script to set up your Supabase database

set -e

echo "🎵 Spotify Clone Database Setup"
echo "================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Supabase CLI installed"
echo ""

# Get project details
read -p "Enter your Supabase project ID: " PROJECT_ID
read -p "Enter your Supabase access token (or press Enter to use local): " ACCESS_TOKEN

# Migrations directory
MIGRATIONS_DIR="./supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

echo ""
echo "📁 Found migration file:"
ls -la "$MIGRATIONS_DIR" | grep sql

echo ""
echo "🚀 Applying migration to database..."

if [ -n "$ACCESS_TOKEN" ]; then
    supabase db push --project-ref "$PROJECT_ID" --auth "$ACCESS_TOKEN"
else
    # Try to use local .env
    if [ -f ".env.local" ]; then
        source .env.local
        supabase db push
    else
        echo "❌ No access token provided and no .env.local found"
        echo "Please run: supabase login"
        echo "Then: supabase link --project-ref $PROJECT_ID"
        exit 1
    fi
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add sample data (optional):"
echo "   npm run db:seed"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000"
echo ""
