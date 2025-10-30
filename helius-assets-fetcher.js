const fetch = require('node-fetch');
require('dotenv').config();

class HeliusAssetsFetcher {
  constructor() {
    this.apiKey = process.env.HELIUS_API_KEY;
    if (!this.apiKey || this.apiKey === 'your_helius_api_key_here') {
      throw new Error('Valid HELIUS_API_KEY required in .env file');
    }
    this.baseUrl = 'https://devnet.helius-rpc.com';
  }

  async getAssetsByOwner(ownerAddress, page = 1, limit = 1000) {
    const response = await fetch(`${this.baseUrl}/?api-key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'assets-request',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page,
          limit
        }
      })
    });

    const data = await response.json();
    return data.result;
  }

  async getAllAssets(ownerAddress) {
    let allAssets = [];
    let page = 1;
    
    while (true) {
      const result = await this.getAssetsByOwner(ownerAddress, page);
      if (!result?.items?.length) break;
      
      allAssets = allAssets.concat(result.items);
      if (result.items.length < 1000) break;
      page++;
    }
    
    return allAssets;
  }
}

async function main() {
  const fetcher = new HeliusAssetsFetcher();
  const [ownerAddress] = process.argv.slice(2);
  
  if (!ownerAddress) {
    console.log('Usage: node helius-assets-fetcher.js <owner_address>');
    return;
  }

  try {
    const assets = await fetcher.getAllAssets(ownerAddress);
    console.log(`Found ${assets.length} assets`);
    console.log(JSON.stringify(assets, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) main();