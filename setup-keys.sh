#!/bin/bash

echo "🏛️ IMPERIAL CRYPTO EMPIRE - KEY GENERATION WIZARD"
echo "=================================================="

# Create secure directory
mkdir -p ~/.config/solana/imperial
chmod 700 ~/.config/solana/imperial

echo "🔑 Generating Imperial Wallets..."

# Generate treasury wallet
echo "📊 Creating Treasury Wallet..."
solana-keygen new --no-bip39-passphrase --outfile ~/.config/solana/imperial/treasury.json --silent
TREASURY_PUBKEY=$(solana-keygen pubkey ~/.config/solana/imperial/treasury.json)
echo "✅ Treasury: $TREASURY_PUBKEY"

# Generate controller wallet
echo "👑 Creating Controller Wallet..."
solana-keygen new --no-bip39-passphrase --outfile ~/.config/solana/imperial/controller.json --silent
CONTROLLER_PUBKEY=$(solana-keygen pubkey ~/.config/solana/imperial/controller.json)
echo "✅ Controller: $CONTROLLER_PUBKEY"

# Generate allowlist wallets
echo "🛡️ Creating Allowlist Wallets..."
for i in {1..3}; do
    solana-keygen new --no-bip39-passphrase --outfile ~/.config/solana/imperial/allowlist$i.json --silent
    ALLOWLIST_ADDR=$(solana-keygen pubkey ~/.config/solana/imperial/allowlist$i.json)
    echo "✅ Allowlist $i: $ALLOWLIST_ADDR"
    ALLOWLIST_ADDRESSES="${ALLOWLIST_ADDRESSES}${ALLOWLIST_ADDR},"
done

# Remove trailing comma
ALLOWLIST_ADDRESSES=${ALLOWLIST_ADDRESSES%,}

# Generate multisig wallets
echo "🔐 Creating Multisig Wallets..."
for i in {1..3}; do
    solana-keygen new --no-bip39-passphrase --outfile ~/.config/solana/imperial/multisig$i.json --silent
    MULTISIG_ADDR=$(solana-keygen pubkey ~/.config/solana/imperial/multisig$i.json)
    echo "✅ Multisig $i: $MULTISIG_ADDR"
    MULTISIG_ADDRESSES="${MULTISIG_ADDRESSES}${MULTISIG_ADDR},"
done

# Remove trailing comma
MULTISIG_ADDRESSES=${MULTISIG_ADDRESSES%,}

echo ""
echo "🏛️ IMPERIAL EMPIRE CONFIGURATION GENERATED!"
echo "============================================="
echo ""
echo "📋 Add these to your .env file:"
echo ""
echo "TREASURY_PUBKEY=$TREASURY_PUBKEY"
echo "CONTROLLER_PUBKEY=$CONTROLLER_PUBKEY"
echo "ALLOWLIST_ADDRESSES=$ALLOWLIST_ADDRESSES"
echo "MULTISIG_ADDRESSES=$MULTISIG_ADDRESSES"
echo "IMPERIAL_TREASURY=$TREASURY_PUBKEY"
echo ""
echo "🔒 Private keys stored in: ~/.config/solana/imperial/"
echo "⚠️  BACKUP THESE FILES IMMEDIATELY!"
echo ""
echo "💰 Fund your treasury wallet:"
echo "solana transfer 0.1 $TREASURY_PUBKEY"
echo ""
echo "🚀 Ready to deploy imperial empire!"