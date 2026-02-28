#!/bin/bash

# Sentinel .env Setup Script
# Generates a secure private key and updates your .env file

set -e

echo "🔐 Sentinel Environment Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env first:"
    echo "  cp .env.example .env"
    exit 1
fi

# Generate private key
echo "🔑 Generating cryptographic private key..."
PRIVATE_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Failed to generate private key"
    exit 1
fi

echo "✅ Generated: $PRIVATE_KEY"
echo ""

# Update .env file
echo "📝 Updating .env file..."

# Check if SENTINEL_PRIVATE_KEY line exists
if grep -q "^SENTINEL_PRIVATE_KEY=" .env; then
    # Replace existing line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^SENTINEL_PRIVATE_KEY=.*/SENTINEL_PRIVATE_KEY=$PRIVATE_KEY/" .env
    else
        # Linux
        sed -i "s/^SENTINEL_PRIVATE_KEY=.*/SENTINEL_PRIVATE_KEY=$PRIVATE_KEY/" .env
    fi
    echo "✅ Updated SENTINEL_PRIVATE_KEY in .env"
else
    # Add new line
    echo "SENTINEL_PRIVATE_KEY=$PRIVATE_KEY" >> .env
    echo "✅ Added SENTINEL_PRIVATE_KEY to .env"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "⚠️  NEXT STEPS - IMPORTANT:"
echo ""
echo "1. Update CORS_ORIGINS in .env with your Vercel URL:"
echo "   nano .env"
echo "   CORS_ORIGINS=https://your-app.vercel.app"
echo ""
echo "2. If deploying to VPS, make .env secure:"
echo "   chmod 600 .env"
echo ""
echo "3. NEVER commit .env to Git!"
echo "   Add to .gitignore: echo '.env' >> .gitignore"
echo ""
echo "🔐 Your private key has been saved to .env"
echo ""
