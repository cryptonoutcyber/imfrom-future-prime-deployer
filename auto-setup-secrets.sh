#!/bin/bash
set -e

echo "🔐 Automated GitHub Secrets Setup for GeneNout v2.0"
echo ""

# Load environment variables
source .env 2>/dev/null || true

# Read signer key
SIGNER_KEY=$(cat .cache/user_auth.json)

# Set secrets using gh CLI
REPO="cryptonoutcyber/imfrom-future-prime-deployer"
echo "📤 Adding secrets to GitHub repo: $REPO..."

gh secret set HELIUS_API_KEY --body "$HELIUS_API_KEY" -R "$REPO"
echo "✅ HELIUS_API_KEY"

gh secret set QUICKNODE_RPC --body "$QUICKNODE_RPC" -R "$REPO"
echo "✅ QUICKNODE_RPC"

gh secret set RPC_URL --body "$RPC_URL" -R "$REPO"
echo "✅ RPC_URL"

gh secret set TREASURY_PUBKEY --body "$TREASURY_PUBKEY" -R "$REPO"
echo "✅ TREASURY_PUBKEY"

gh secret set RELAYER_PUBKEY --body "$RELAYER_PUBKEY" -R "$REPO"
echo "✅ RELAYER_PUBKEY"

gh secret set SIGNER_WALLET_PRIVATE_KEY --body "$SIGNER_KEY" -R "$REPO"
echo "✅ SIGNER_WALLET_PRIVATE_KEY"

echo ""
echo "🎉 All secrets added successfully!"
echo ""
echo "🚀 Triggering workflow..."
gh workflow run genenout-deploy.yml -R "$REPO"

echo ""
echo "✅ GeneNout v2.0 autonomous deployment initiated!"
echo "📊 Check status: gh run list"
