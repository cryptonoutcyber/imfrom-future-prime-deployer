const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '4fe39d22-5043-40d3-b2a1-dd8968ecf8a6';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

class HeliusAllowlistSearch {
  constructor() {
    this.allowlist = this.loadAllowlist();
  }

  loadAllowlist() {
    const allowlistPath = '.cache/allowlist.json';
    if (fs.existsSync(allowlistPath)) {
      return JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
    }
    return {
      addresses: [
        '4gLAGDEHs6sJ6AMmLdAwCUx9NPmPLxoMCZ3yiKyAyQ1m',
        '83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri',
        '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y',
        'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ',
        'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp'
      ],
      programs: [
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
        'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
      ]
    };
  }

  saveAllowlist() {
    fs.writeFileSync('.cache/allowlist.json', JSON.stringify(this.allowlist, null, 2));
  }

  addAddress(address) {
    if (!this.allowlist.addresses.includes(address)) {
      this.allowlist.addresses.push(address);
      this.saveAllowlist();
      console.log('✅ Added to allowlist:', address);
    } else {
      console.log('⚠️  Already in allowlist:', address);
    }
  }

  isAllowed(address) {
    return this.allowlist.addresses.includes(address) || this.allowlist.programs.includes(address);
  }

  async searchAssets(address) {
    if (!this.isAllowed(address)) {
      console.log('❌ Address not in allowlist:', address);
      return null;
    }

    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'searchAssets',
        params: {
          ownerAddress: address,
          tokenType: 'all',
          displayOptions: { showNativeBalance: true }
        }
      })
    });

    const data = await response.json();
    return data.result;
  }

  async getAccountInfo(address) {
    if (!this.isAllowed(address)) {
      console.log('❌ Address not in allowlist:', address);
      return null;
    }

    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [address, { encoding: 'base64' }]
      })
    });

    const data = await response.json();
    return data.result?.value;
  }

  listAllowlist() {
    console.log('📋 ALLOWLIST:\n');
    console.log('Addresses:');
    this.allowlist.addresses.forEach((addr, i) => {
      console.log(`  ${i + 1}. ${addr}`);
    });
    console.log('\nPrograms:');
    this.allowlist.programs.forEach((prog, i) => {
      console.log(`  ${i + 1}. ${prog}`);
    });
  }
}

async function main() {
  const allowlist = new HeliusAllowlistSearch();
  const [command, address] = process.argv.slice(2);

  if (!command) {
    console.log('Usage: node helius-allowlist-search.js <command> [address]');
    console.log('\nCommands:');
    console.log('  list              - Show allowlist');
    console.log('  add <address>     - Add address to allowlist');
    console.log('  search <address>  - Search assets (allowlist only)');
    console.log('  info <address>    - Get account info (allowlist only)');
    return;
  }

  switch (command) {
    case 'list':
      allowlist.listAllowlist();
      break;

    case 'add':
      if (!address) {
        console.log('❌ Address required');
        return;
      }
      allowlist.addAddress(address);
      break;

    case 'search':
      if (!address) {
        console.log('❌ Address required');
        return;
      }
      const assets = await allowlist.searchAssets(address);
      if (assets) {
        console.log('Assets:', assets.total || 0);
        console.log('SOL:', assets.nativeBalance?.lamports / 1e9 || 0);
      }
      break;

    case 'info':
      if (!address) {
        console.log('❌ Address required');
        return;
      }
      const info = await allowlist.getAccountInfo(address);
      if (info) {
        console.log('Balance:', info.lamports / 1e9, 'SOL');
        console.log('Owner:', info.owner);
      }
      break;

    default:
      console.log('Unknown command');
  }
}

if (require.main === module) main();