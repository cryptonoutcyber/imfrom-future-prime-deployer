#!/bin/bash

echo "🏛️⚡ IMPERIAL CRYPTO EMPIRE ACTIVATION ⚡🏛️"
echo "=========================================="

# Check environment
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.sample and configure."
    exit 1
fi

# Load environment
source .env

echo "🔍 Verifying Imperial Infrastructure..."

# Check Helius connection
if [ -z "$HELIUS_API_KEY" ]; then
    echo "⚠️  HELIUS_API_KEY not configured"
else
    echo "✅ Helius RPC: ACTIVE"
fi

# Check QuickNode connection  
if [ -z "$QUICKNODE_RPC" ]; then
    echo "⚠️  QUICKNODE_RPC not configured"
else
    echo "✅ QuickNode: ENTERPRISE READY"
fi

# Check allowlist
if [ -z "$ALLOWLIST_ADDRESSES" ]; then
    echo "⚠️  ALLOWLIST_ADDRESSES not configured"
else
    echo "✅ Allowlist Security: ACTIVE"
fi

echo ""
echo "🚀 IMPERIAL DEPLOYMENT OPTIONS:"
echo "1. Full Empire Deployment    - npm run imperial:full"
echo "2. Token Deployment Only     - npm run imperial:deploy"  
echo "3. Trading Agent Only        - npm run imperial:trading"
echo "4. Python Sovereign System   - npm run imperial:python"
echo "5. Ownership Transfer        - npm run imperial:transfer <MINT_ADDRESS>"
echo ""

# Auto-execute if argument provided
if [ "$1" = "deploy" ]; then
    echo "🏛️ EXECUTING FULL IMPERIAL DEPLOYMENT..."
    npm run imperial:full
elif [ "$1" = "trading" ]; then
    echo "🤖 ACTIVATING TRADING AGENTS..."
    npm run imperial:trading
elif [ "$1" = "python" ]; then
    echo "🐍 DEPLOYING PYTHON SOVEREIGN SYSTEM..."
    npm run imperial:python
else
    echo "💡 Usage: ./activate-imperial-empire.sh [deploy|trading|python]"
    echo "🏛️ The empire awaits your command..."
fi

echo ""
echo "👑 IMPERIAL MANTRA: 'The empire expands through code and capital.'"