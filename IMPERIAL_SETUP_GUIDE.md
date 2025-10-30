# 🏛️ IMPERIAL CRYPTO EMPIRE SETUP GUIDE

## 🔑 STEP 1: API KEYS & RPC ENDPOINTS

### Helius API Key
1. Visit [helius.dev](https://helius.dev)
2. Create account → Get API key
3. Add to `.env`: `HELIUS_API_KEY=your_key_here`

### QuickNode (Optional)
1. Visit [quicknode.com](https://quicknode.com)
2. Create Solana mainnet endpoint
3. Add to `.env`: `QUICKNODE_RPC=https://your-endpoint.solana-mainnet.quiknode.pro/your_key/`

## 🔐 STEP 2: WALLET SETUP

### Generate New Wallets
```bash
# Generate treasury wallet
solana-keygen new --outfile ~/.config/solana/treasury.json

# Generate controller wallet  
solana-keygen new --outfile ~/.config/solana/controller.json

# Get public keys
solana-keygen pubkey ~/.config/solana/treasury.json
solana-keygen pubkey ~/.config/solana/controller.json
```

### Fund Wallets
```bash
# Check balance
solana balance <WALLET_ADDRESS>

# Fund with SOL (minimum 0.1 SOL recommended)
# Transfer from your main wallet or exchange
```

## 🛡️ STEP 3: ALLOWLIST CONFIGURATION

### Create Allowlist Addresses
```bash
# Generate 3 allowlist wallets
solana-keygen new --outfile ~/.config/solana/allowlist1.json
solana-keygen new --outfile ~/.config/solana/allowlist2.json  
solana-keygen new --outfile ~/.config/solana/allowlist3.json

# Get public keys
solana-keygen pubkey ~/.config/solana/allowlist1.json
solana-keygen pubkey ~/.config/solana/allowlist2.json
solana-keygen pubkey ~/.config/solana/allowlist3.json
```

## ⚙️ STEP 4: ENVIRONMENT CONFIGURATION

### Complete .env Setup
```bash
# Copy template
cp .env.sample .env

# Edit with your values
nano .env
```

### Required Variables
```env
# RPC Configuration
HELIUS_API_KEY=your_helius_api_key_here
RPC_URL_WITH_KEY=https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}
QUICKNODE_RPC=https://your-quicknode-endpoint

# Treasury & Control
TREASURY_PUBKEY=your_treasury_public_key
CONTROLLER_PUBKEY=your_controller_public_key
DAO_PUBKEY=your_dao_multisig_pubkey

# Allowlist (comma-separated)
ALLOWLIST_ADDRESSES=addr1,addr2,addr3
MULTISIG_ADDRESSES=multisig1,multisig2,multisig3

# Imperial Configuration
IMPERIAL_TREASURY=your_imperial_treasury_address
TRADING_ENABLED=true
MEV_PROTECTION=true
ARBITRAGE_THRESHOLD=0.02
MAX_POSITION_SIZE=10000

# Security
AUTHORITY_MODE=null
DRY_RUN=false
```

## 🚀 STEP 5: DEPLOYMENT

### Verify Setup
```bash
npm run dev:check
```

### Deploy Imperial Empire
```bash
# Full deployment
./activate-imperial-empire.sh deploy

# Or step by step
npm run imperial:deploy
npm run imperial:trading
```

## 🔒 STEP 6: SECURITY CHECKLIST

- [ ] All private keys stored securely (not in .env)
- [ ] .env file added to .gitignore
- [ ] Allowlist addresses verified
- [ ] Multisig threshold set (minimum 2/3)
- [ ] Test deployment on devnet first
- [ ] Backup all keypair files
- [ ] Enable hardware wallet for production

## ⚡ QUICK COMMANDS

```bash
# Check wallet balance
solana balance <ADDRESS>

# Transfer ownership
npm run solana:transfer-owner -- <MINT> <NEW_OWNER>

# Monitor empire
npm run quick-monitor

# Emergency rollback
npm run mainnet:rollback
```

**🏛️ The empire expands through code and capital. Deploy with imperial authority! ⚡**