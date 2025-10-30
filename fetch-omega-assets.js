const { Connection, PublicKey } = require('@solana/web3.js');
const fetch = require('node-fetch');
const contracts = require('./contract_addresses.json');
require('dotenv').config();

class OmegaAssetsFetcher {
  constructor() {
    this.quicknode = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
    this.helius = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  }

  async getAccountInfo(address) {
    try {
      const pubkey = new PublicKey(address);
      const info = await this.quicknode.getAccountInfo(pubkey);
      return info ? { address, exists: true, lamports: info.lamports, owner: info.owner.toString() } : { address, exists: false };
    } catch (error) {
      return { address, error: error.message };
    }
  }

  async getTokenAccounts(address) {
    try {
      const pubkey = new PublicKey(address);
      const accounts = await this.quicknode.getParsedTokenAccountsByOwner(
        pubkey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      return accounts.value.map(acc => ({
        mint: acc.account.data.parsed.info.mint,
        balance: acc.account.data.parsed.info.tokenAmount.uiAmount
      }));
    } catch (error) {
      return [];
    }
  }

  async fetchFirst10() {
    const addresses = contracts.omega_prime_addresses.all_addresses_list.slice(0, 10);
    const results = [];

    for (const address of addresses) {
      console.log(`Fetching: ${address}`);
      const [info, tokens] = await Promise.all([
        this.getAccountInfo(address),
        this.getTokenAccounts(address)
      ]);
      results.push({ ...info, tokens });
    }

    return results;
  }
}

async function main() {
  const fetcher = new OmegaAssetsFetcher();
  console.log('🔍 Fetching first 10 Omega Prime assets...\n');
  
  const results = await fetcher.fetchFirst10();
  
  console.log('\n📊 Results:');
  results.forEach((result, i) => {
    console.log(`\n${i + 1}. ${result.address}`);
    console.log(`   Exists: ${result.exists}`);
    if (result.lamports) console.log(`   SOL: ${result.lamports / 1e9}`);
    if (result.tokens?.length) console.log(`   Tokens: ${result.tokens.length}`);
  });
}

if (require.main === module) main();