# 🔐 GitHub Secrets Setup (Manual)

The GitHub token doesn't have permission to set secrets via CLI.

## Quick Setup via GitHub UI:

**Go to:** https://github.com/cryptonoutcyber/imfrom-future-prime-deployer/settings/secrets/actions/new

**Add these 6 secrets:**

### 1. HELIUS_API_KEY
```
4fe39d22-5043-40d3-b2a1-dd8968ecf8a6
```

### 2. QUICKNODE_RPC
```
https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e
```

### 3. RPC_URL
```
https://api.mainnet-beta.solana.com
```

### 4. TREASURY_PUBKEY
```
EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6
```

### 5. RELAYER_PUBKEY
```
8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y
```

### 6. SIGNER_WALLET_PRIVATE_KEY
```
[84,32,127,214,116,85,6,53,123,7,157,124,156,124,90,0,67,65,168,44,121,219,184,2,228,213,113,213,202,218,9,222,90,172,60,63,40,62,136,119,36,193,119,154,84,58,209,237,238,119,144,82,128,70,61,171,218,63,186,120,57,121,163,150]
```

## Then trigger workflow:

**Go to:** https://github.com/cryptonoutcyber/imfrom-future-prime-deployer/actions/workflows/genenout-deploy.yml

Click: **Run workflow** → **Run workflow**

✅ GeneNout will then run every 30 minutes automatically!
