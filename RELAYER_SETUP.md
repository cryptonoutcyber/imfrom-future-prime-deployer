# 🚀 RELAYER SETUP - ZERO COST DEPLOYMENT

## What You Have
- ✅ Complete deployment system
- ✅ User auth keypair (76x25b6X...)
- ✅ Relayer integration code
- ❌ Relayer service not configured

## What is a Relayer?
A relayer is a service that:
- Pays transaction fees for you
- You sign transactions
- Relayer submits and pays SOL fees
- **YOU PAY ZERO SOL**

## Free Relayer Options

### 1. Helius (Recommended)
```bash
# Update .env
RELAYER_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
RELAYER_PUBKEY=<helius_fee_payer_address>
RELAYER_API_KEY=4fe39d22-5043-40d3-b2a1-dd8968ecf8a6
```

### 2. QuickNode
```bash
RELAYER_URL=https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e
RELAYER_PUBKEY=<quicknode_fee_payer>
```

### 3. Self-Hosted Relayer
Deploy your own relayer with the funded address (8cRrU1Nz... with 1.11 SOL)

## Quick Deploy (Once Relayer Configured)

```bash
# Set treasury
export TREASURY_PUBKEY=4gLAGDEHs6sJ6AMmLdAwCUx9NPmPLxoMCZ3yiKyAyQ1m

# Deploy token (ZERO COST)
npm run mainnet:all
```

## Current Status
- User keypair: 76x25b6XWTwbm6MTBJtbFU1hFopBSDKsfmGC7MK929RX (0 SOL - OK!)
- Relayer: NOT CONFIGURED
- Once configured: Deploy with ZERO personal SOL cost!
