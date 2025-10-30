const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

class QuickNodeAssets {
  constructor() {
    this.quicknodeUrl = 'https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e';
    this.connection = new Connection(this.quicknodeUrl);
  }

  async getProgramAccounts(programId, limit = 10) {
    try {
      const accounts = await this.connection.getProgramAccounts(
        new PublicKey(programId),
        {
          commitment: 'confirmed',
          encoding: 'base64',
          filters: [{ dataSize: 165 }] // Token account size
        }
      );
      return accounts.slice(0, limit);
    } catch (error) {
      console.error('QuickNode error:', error.message);
      return [];
    }
  }

  async getTokenAccounts(owner, limit = 10) {
    try {
      const accounts = await this.connection.getParsedTokenAccountsByOwner(
        new PublicKey(owner),
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      return accounts.value.slice(0, limit);
    } catch (error) {
      console.error('QuickNode token accounts error:', error.message);
      return [];
    }
  }
}

async function main() {
  const quicknode = new QuickNodeAssets();
  const [command, address] = process.argv.slice(2);

  if (!address) {
    console.log('Usage: node quicknode-assets.js <program|tokens> <address>');
    return;
  }

  try {
    switch (command) {
      case 'program':
        const accounts = await quicknode.getProgramAccounts(address);
        console.log(`Found ${accounts.length} program accounts:`);
        accounts.forEach((acc, i) => {
          console.log(`${i + 1}. ${acc.pubkey.toString()}`);
        });
        break;

      case 'tokens':
        const tokens = await quicknode.getTokenAccounts(address);
        console.log(`Found ${tokens.length} token accounts:`);
        tokens.forEach((token, i) => {
          const info = token.account.data.parsed.info;
          console.log(`${i + 1}. Mint: ${info.mint}, Balance: ${info.tokenAmount.uiAmount}`);
        });
        break;

      default:
        console.log('Use "program" or "tokens" command');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) main();