const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class KeysMultisigChecker {
  constructor() {
    this.connection = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
    this.accessibleAccounts = [
      'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ',
      '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y',
      '9HUvuQHBHkihcrhiucdYFjk1q4jUgozakoYsubYrHiJS',
      'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp'
    ];
  }

  checkLocalKeys() {
    const keyPaths = [
      '.env',
      'keys/',
      '.cache/',
      path.join(process.env.HOME || '~', '.config/solana/id.json'),
      path.join(process.env.HOME || '~', '.config/solana/')
    ];

    const found = [];
    keyPaths.forEach(p => {
      if (fs.existsSync(p)) {
        found.push({ path: p, exists: true });
      }
    });

    return found;
  }

  async checkMultisig(address) {
    try {
      const pubkey = new PublicKey(address);
      const info = await this.connection.getAccountInfo(pubkey);
      
      if (!info) return { address, isMultisig: false };

      // Check if owned by multisig program
      const isMultisig = info.owner.toString() === 'msigmtwzgXJHj2ext4XJjCDmpbcWUus9ezYXDpZJvS8' ||
                         info.owner.toString() === 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf';

      if (isMultisig) {
        return {
          address,
          isMultisig: true,
          owner: info.owner.toString(),
          data: info.data.length
        };
      }

      return { address, isMultisig: false, owner: info.owner.toString() };
    } catch (error) {
      return { address, error: error.message };
    }
  }

  async checkProgramAuthority(programAddress) {
    try {
      const pubkey = new PublicKey(programAddress);
      const info = await this.connection.getAccountInfo(pubkey);
      
      if (!info || !info.executable) return null;

      // Get program data account for upgradeable programs
      const [programDataAddress] = PublicKey.findProgramAddressSync(
        [pubkey.toBuffer()],
        new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
      );

      const programData = await this.connection.getAccountInfo(programDataAddress);
      if (programData) {
        // Parse upgrade authority from program data
        const upgradeAuthority = new PublicKey(programData.data.slice(13, 45));
        return { program: programAddress, upgradeAuthority: upgradeAuthority.toString() };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async fullScan() {
    console.log('🔍 CHECKING PRIVATE KEYS & MULTISIG ACCESS\n');

    // 1. Check local keys
    console.log('📁 Local Key Files:');
    const localKeys = this.checkLocalKeys();
    localKeys.forEach(k => console.log(`  ${k.exists ? '✅' : '❌'} ${k.path}`));

    // 2. Check multisig
    console.log('\n🔐 Multisig Check:');
    for (const address of this.accessibleAccounts) {
      const result = await this.checkMultisig(address);
      console.log(`  ${result.isMultisig ? '🔒' : '🔓'} ${address.slice(0, 8)}... ${result.isMultisig ? 'MULTISIG' : 'REGULAR'}`);
      if (result.isMultisig) {
        console.log(`     Owner: ${result.owner}`);
      }
    }

    // 3. Check program authorities
    console.log('\n⚙️ Program Authority Check:');
    const programAddress = 'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp';
    const authority = await this.checkProgramAuthority(programAddress);
    if (authority) {
      console.log(`  Program: ${authority.program}`);
      console.log(`  Upgrade Authority: ${authority.upgradeAuthority}`);
    } else {
      console.log(`  ❌ No upgradeable program found`);
    }

    // 4. Recommendations
    console.log('\n💡 RECOMMENDATIONS:\n');
    if (localKeys.length === 0) {
      console.log('  ⚠️ NO PRIVATE KEYS FOUND LOCALLY');
      console.log('  • Check backup locations');
      console.log('  • Check hardware wallet');
      console.log('  • May need to create new keys');
    }

    console.log('\n  📋 NEXT STEPS:');
    console.log('  1. If multisig: Get other signers to reannounce');
    console.log('  2. If regular: Import private key to wallet');
    console.log('  3. Run: npm run mainnet:reannounce-controller');
    console.log('  4. Redeploy bot army contracts');
  }
}

async function main() {
  const checker = new KeysMultisigChecker();
  await checker.fullScan();
}

if (require.main === module) main();