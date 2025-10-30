const fetch = require('node-fetch');
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

class HeliusComplete {
  constructor(network = 'devnet') {
    this.apiKey = process.env.HELIUS_API_KEY;
    this.network = network;
    this.rpcUrl = `https://${network}.helius-rpc.com/?api-key=${this.apiKey}`;
    this.apiUrl = `https://api.helius.xyz/v0`;
    this.connection = new Connection(this.rpcUrl);
  }

  // Enhanced RPC Methods
  async getAssetsByOwner(owner, page = 1, limit = 1000) {
    return this.rpcCall('getAssetsByOwner', { ownerAddress: owner, page, limit });
  }

  async getAsset(assetId) {
    return this.rpcCall('getAsset', { id: assetId });
  }

  async getAssetProof(assetId) {
    return this.rpcCall('getAssetProof', { id: assetId });
  }

  async searchAssets(params) {
    return this.rpcCall('searchAssets', params);
  }

  // Webhook Management
  async createWebhook(webhookURL, transactionTypes, accountAddresses) {
    return this.apiCall('POST', '/webhooks', {
      webhookURL,
      transactionTypes,
      accountAddresses
    });
  }

  async getWebhooks() {
    return this.apiCall('GET', '/webhooks');
  }

  // Address Lookup Tables
  async getAddressLookupTable(address) {
    return this.rpcCall('getAddressLookupTable', { address });
  }

  // Token Metadata
  async getTokenMetadata(mintAccounts) {
    return this.apiCall('POST', '/token-metadata', { mintAccounts });
  }

  // NFT Fingerprinting
  async getNftFingerprint(mints) {
    return this.apiCall('POST', '/nft-fingerprint', { mints });
  }

  // Mint API
  async getMintlist(query) {
    return this.apiCall('GET', `/mintlist?${new URLSearchParams(query)}`);
  }

  // Transaction Parsing
  async parseTransactions(transactions) {
    return this.apiCall('POST', '/transactions', { transactions });
  }

  // Enhanced Transaction History
  async getEnhancedTransactions(address, before = null) {
    const params = { address };
    if (before) params.before = before;
    return this.apiCall('GET', `/addresses/${address}/transactions?${new URLSearchParams(params)}`);
  }

  // Balances
  async getBalances(addresses) {
    return this.apiCall('POST', '/balances', { addresses });
  }

  // Priority Fee Estimation
  async getPriorityFeeEstimate(accountKeys, options = {}) {
    return this.rpcCall('getPriorityFeeEstimate', { accountKeys, options });
  }

  // Helper Methods
  async rpcCall(method, params) {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
      })
    });
    const data = await response.json();
    return data.result;
  }

  async apiCall(method, endpoint, body = null) {
    const options = {
      method,
      headers: { 
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${this.apiUrl}${endpoint}`, options);
    return await response.json();
  }
}

async function demo() {
  const helius = new HeliusComplete('devnet');
  const address = '4gLAGDEHs6sJ6AMmLdAwCUx9NPmPLxoMCZ3yiKyAyQ1m';

  console.log('🔍 Helius Complete Demo');
  
  try {
    // Test multiple endpoints
    const [assets, transactions, balances] = await Promise.allSettled([
      helius.getAssetsByOwner(address),
      helius.getEnhancedTransactions(address),
      helius.getBalances([address])
    ]);

    console.log('Assets:', assets.status === 'fulfilled' ? assets.value : 'Failed');
    console.log('Transactions:', transactions.status === 'fulfilled' ? transactions.value : 'Failed');
    console.log('Balances:', balances.status === 'fulfilled' ? balances.value : 'Failed');

  } catch (error) {
    console.error('Demo error:', error.message);
  }
}

if (require.main === module) demo();