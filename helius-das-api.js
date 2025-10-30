const fetch = require('node-fetch');
require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '4fe39d22-5043-40d3-b2a1-dd8968ecf8a6';
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

class HeliusDAS {
  // DAS API - READ ONLY METHODS
  
  async getAsset(assetId) {
    const response = await fetch(HELIUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-asset',
        method: 'getAsset',
        params: { id: assetId }
      })
    });
    return (await response.json()).result;
  }

  async getAssetsByOwner(ownerAddress) {
    const response = await fetch(HELIUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-assets',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page: 1,
          limit: 1000
        }
      })
    });
    return (await response.json()).result;
  }

  async searchAssets(params) {
    const response = await fetch(HELIUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'search-assets',
        method: 'searchAssets',
        params
      })
    });
    return (await response.json()).result;
  }
}

console.log('📚 HELIUS DAS API - DOCUMENTATION SUMMARY\n');
console.log('✅ DAS API CAN:');
console.log('  - getAsset() - Read NFT/token metadata');
console.log('  - getAssetsByOwner() - List assets owned by address');
console.log('  - searchAssets() - Search for assets');
console.log('  - getAssetProof() - Get Merkle proof for compressed NFTs');
console.log('  - getAssetsByGroup() - Get assets by collection');
console.log('\n❌ DAS API CANNOT:');
console.log('  - Create NFTs (requires transaction signing)');
console.log('  - Mint tokens (requires transaction signing)');
console.log('  - Transfer assets (requires transaction signing)');
console.log('\n💡 TO CREATE NFT/TOKEN:');
console.log('  1. Build transaction with Metaplex/SPL Token');
console.log('  2. Sign with private key');
console.log('  3. Submit to network');
console.log('  4. THEN use DAS API to read the created asset');
console.log('\n🔗 DAS API is READ-ONLY for querying existing assets');
console.log('🔗 Creation requires wallet with SOL + private key');

async function demo() {
  const das = new HeliusDAS();
  console.log('\n📊 DEMO: Checking your assets...\n');
  
  const assets = await das.getAssetsByOwner('4gLAGDEHs6sJ6AMmLdAwCUx9NPmPLxoMCZ3yiKyAyQ1m');
  console.log('Your assets:', assets.total || 0);
  console.log('Native balance:', assets.nativeBalance?.lamports / 1e9 || 0, 'SOL');
}

demo();