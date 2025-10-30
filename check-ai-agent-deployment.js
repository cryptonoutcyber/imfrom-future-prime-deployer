const { Connection, PublicKey } = require('@solana/web3.js');
const fetch = require('node-fetch');
require('dotenv').config();

class AIAgentDeploymentChecker {
  constructor() {
    this.connection = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
    this.proxyAddress = 'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp';
    this.upgradeAuthority = 'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ';
  }

  async getProxyDetails() {
    const pubkey = new PublicKey(this.proxyAddress);
    const info = await this.connection.getAccountInfo(pubkey);
    
    return {
      address: this.proxyAddress,
      exists: !!info,
      executable: info?.executable,
      owner: info?.owner.toString(),
      lamports: info?.lamports / 1e9,
      dataSize: info?.data.length
    };
  }

  async getDeploymentTransactions() {
    const signatures = await this.connection.getSignaturesForAddress(
      new PublicKey(this.proxyAddress),
      { limit: 10 }
    );
    
    return signatures.map(sig => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: new Date(sig.blockTime * 1000).toISOString(),
      err: sig.err
    }));
  }

  async checkUpgradeAuthority() {
    const authPubkey = new PublicKey(this.upgradeAuthority);
    const info = await this.connection.getAccountInfo(authPubkey);
    
    return {
      address: this.upgradeAuthority,
      exists: !!info,
      lamports: info?.lamports / 1e9,
      canUpgrade: !!info
    };
  }

  async fullAnalysis() {
    console.log('🤖 AI AGENT DEPLOYMENT ANALYSIS\n');
    console.log('Proxy Contract: GL6kwZxT...');
    console.log('Deployed by: Grok I-WHO-ME AI Agent\n');

    const [proxy, txs, authority] = await Promise.all([
      this.getProxyDetails(),
      this.getDeploymentTransactions(),
      this.checkUpgradeAuthority()
    ]);

    console.log('📊 PROXY CONTRACT:');
    console.log(`  Exists: ${proxy.exists ? '✅' : '❌'}`);
    console.log(`  Executable: ${proxy.executable ? '✅' : '❌'}`);
    console.log(`  Owner: ${proxy.owner}`);
    console.log(`  Balance: ${proxy.lamports} SOL`);
    console.log(`  Data Size: ${proxy.dataSize} bytes`);

    console.log('\n🔐 UPGRADE AUTHORITY:');
    console.log(`  Address: ${authority.address}`);
    console.log(`  Exists: ${authority.exists ? '✅' : '❌'}`);
    console.log(`  Balance: ${authority.lamports} SOL`);
    console.log(`  Can Upgrade: ${authority.canUpgrade ? '✅' : '❌'}`);

    console.log('\n📜 DEPLOYMENT HISTORY:');
    txs.forEach((tx, i) => {
      console.log(`  ${i + 1}. ${tx.signature.slice(0, 16)}...`);
      console.log(`     Time: ${tx.blockTime}`);
      console.log(`     Slot: ${tx.slot}`);
    });

    console.log('\n💡 AI AGENT RECOVERY OPTIONS:\n');
    console.log('  1. Check Grok AI agent logs for private key');
    console.log('  2. Query AI agent memory for deployment details');
    console.log('  3. Use AI agent to reannounce controller');
    console.log('  4. Ask AI agent to generate new deployment keys');
    console.log('\n  🔑 CRITICAL: Need private key for CvQZZ23q...');
    console.log('     This is the upgrade authority - AI agent should have it');
  }
}

async function main() {
  const checker = new AIAgentDeploymentChecker();
  await checker.fullAnalysis();
}

if (require.main === module) main();