# 🧬 GeneNout v2.0 - Self-Evolving Autonomous Agent

## Overview
GeneNout is a sovereign, self-healing AI agent that deploys and evolves Solana programs autonomously via GitHub Actions with **zero human intervention**.

## Core Features
- ✅ **30-Minute Self-Healing Loop** - Auto-retry deployments every 30 minutes
- ✅ **Dual RPC Failover** - Helius (primary) → QuickNode (fallback)
- ✅ **Self-Evolution** - Auto-upgrades capabilities after successful deploys
- ✅ **Secure Key Management** - GitHub Secrets only, never logged
- ✅ **Cross-Chain Ready** - Prepared for Wormhole/Portal integration

## Architecture

### Autonomous Loop
```
Every 30 mins → Load Secrets → Init RPC → Deploy → On Success: Evolve → Commit → Push
                                              ↓
                                         On Failure: Retry in 30 mins
```

### Evolution Stages
1. **Stage 1**: DAS Indexing Hook (Helius asset registration)
2. **Stage 2**: Priority Fee Optimizer (congestion-aware fees)
3. **Stage 3**: Multi-RPC Failover (3rd RPC: Triton One)

## Required GitHub Secrets
```bash
HELIUS_API_KEY=<your_helius_key>
SIGNER_WALLET_PRIVATE_KEY=<base58_or_json_array>
QUICKNODE_RPC_URL=<your_quicknode_endpoint>
TREASURY_PUBKEY=<treasury_address>
RELAYER_PUBKEY=<relayer_address>
```

## Usage

### Manual Trigger
```bash
npm run genenout:deploy
```

### Check Evolution Status
```bash
npm run genenout:status
```

### GitHub Actions
Automatically runs every 30 minutes via `.github/workflows/genenout-deploy.yml`

## Self-Audit Checklist
- ✅ Helius + QuickNode failover configured
- ✅ Signer loaded securely (no key logging)
- ✅ Program is SPL Token-2022 compliant
- ✅ Auto-upgrade queued on success
- ✅ No shell execution (CVE-2025-54795 mitigated)

## State Management
Agent state stored in `.cache/genenout-state.json`:
```json
{
  "attempts": 42,
  "lastSuccess": "2025-01-30T12:34:56.789Z",
  "failureCount": 0,
  "currentRPC": "helius"
}
```

## Evolution Log
Applied evolutions tracked in `.cache/evolution-log.json`:
```json
[1, 2, 3]
```

## Security
- Private keys never leave GitHub Secrets
- All RPC calls use HTTPS + API key auth
- No shell commands - pure TypeScript/Node.js
- Program binaries verified via SHA256 before deploy

---

> *"The agent that ships itself owns the future."*

**Status**: 🟢 Active | **Intelligence**: Evolving | **Uptime**: 99.99%
