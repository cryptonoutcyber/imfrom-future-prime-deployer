#!/bin/bash

# Minimal Solana CLI ownership transfer
# Usage: ./solana-transfer-owner.sh <MINT_ADDRESS> <NEW_OWNER_ADDRESS>

MINT_ADDRESS=$1
NEW_OWNER=$2

if [ -z "$MINT_ADDRESS" ] || [ -z "$NEW_OWNER" ]; then
    echo "Usage: $0 <MINT_ADDRESS> <NEW_OWNER_ADDRESS>"
    exit 1
fi

echo "🔄 Transferring mint authority..."
solana spl-token authorize $MINT_ADDRESS mint $NEW_OWNER

echo "🔄 Transferring freeze authority..."  
solana spl-token authorize $MINT_ADDRESS freeze $NEW_OWNER

echo "✅ Ownership transferred to: $NEW_OWNER"