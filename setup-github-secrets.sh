#!/bin/bash
# Setup GitHub Secrets for GeneNout Autonomous Deployment

echo "🔐 Setting up GitHub Secrets for GeneNout v2.0"
echo ""

# Read user_auth.json and convert to base58
USER_AUTH_JSON=$(cat .cache/user_auth.json)

echo "📋 Required GitHub Secrets:"
echo ""
echo "HELIUS_API_KEY=4fe39d22-5043-40d3-b2a1-dd8968ecf8a6"
echo "QUICKNODE_RPC=https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e"
echo "RPC_URL=https://api.mainnet-beta.solana.com"
echo "TREASURY_PUBKEY=EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6"
echo "RELAYER_PUBKEY=8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y"
echo "SIGNER_WALLET_PRIVATE_KEY=$USER_AUTH_JSON"
echo ""
echo "🚀 Add these to: GitHub Repo → Settings → Secrets and variables → Actions"
echo ""
echo "✅ Then trigger workflow: Actions → GeneNout v2.0 → Run workflow"
