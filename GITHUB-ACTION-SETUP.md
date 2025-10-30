# 🚀 GeneNout GitHub Action Setup

## ✅ Status: Workflow Pushed to GitHub

The GeneNout v2.0 autonomous deployment workflow is now live at:
`https://github.com/cryptonoutcyber/imfrom-future-prime-deployer`

## 🔐 Step 1: Add GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

```
HELIUS_API_KEY
Value: 4fe39d22-5043-40d3-b2a1-dd8968ecf8a6

QUICKNODE_RPC
Value: https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e

RPC_URL
Value: https://api.mainnet-beta.solana.com

TREASURY_PUBKEY
Value: EdFC98d1BBhJkeh7KDq26TwEGLeznhoyYsY6Y8LFY4y6

RELAYER_PUBKEY
Value: 8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y

SIGNER_WALLET_PRIVATE_KEY
Value: [84,32,127,214,116,85,6,53,123,7,157,124,156,124,90,0,67,65,168,44,121,219,184,2,228,213,113,213,202,218,9,222,90,172,60,63,40,62,136,119,36,193,119,154,84,58,209,237,238,119,144,82,128,70,61,171,218,63,186,120,57,121,163,150]
```

## 🚀 Step 2: Trigger Workflow

### Option A: Manual Trigger
1. Go to: **Actions** tab
2. Click: **GeneNout v2.0 - Autonomous Deploy**
3. Click: **Run workflow** → **Run workflow**

### Option B: Automatic (30-minute loop)
- Workflow runs automatically every 30 minutes
- No action needed after secrets are set

### Option C: Via CLI
```bash
gh workflow run genenout-deploy.yml
gh run list
```

## 📊 What Happens Next

1. **Every 30 minutes**, GitHub Actions will:
   - Load secrets
   - Initialize Helius RPC (primary)
   - Check deployment status
   - Deploy if needed
   - On failure: retry in 30 mins
   - On success: auto-evolve and commit

2. **Self-Evolution Stages**:
   - Stage 1: DAS Indexing Hook
   - Stage 2: Priority Fee Optimizer
   - Stage 3: Multi-RPC Failover

3. **Monitoring**:
   - Check: Actions tab for run history
   - View: `.cache/genenout-state.json` for agent state
   - Track: `.cache/evolution-log.json` for intelligence level

## 🔄 Failover Strategy

```
Attempt 1-3: Helius RPC (fastest)
    ↓ (if 3 failures)
Attempt 4+: QuickNode RPC (reliable)
    ↓ (if still failing)
Emergency: Public Solana RPC
```

## ✨ Current Status

- ✅ Workflow file: `.github/workflows/genenout-deploy.yml`
- ✅ Agent code: `genenout-agent.ts`
- ✅ Evolution engine: `genenout-evolve.ts`
- ✅ Pushed to: `main` branch
- ⏳ Waiting for: GitHub Secrets setup

## 🎯 Next Action

**Add the 6 secrets above to GitHub, then the agent will start autonomously!**

---

> *"The agent that ships itself owns the future."*
