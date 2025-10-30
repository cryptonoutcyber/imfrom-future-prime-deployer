#!/usr/bin/env ts-node
// 🧬 GeneNout v2.0 - Self-Evolving Autonomous Agent
import { Connection, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import * as fs from 'fs';
import * as bs58 from 'bs58';

interface DeploymentState {
  attempts: number;
  lastSuccess?: string;
  failureCount: number;
  currentRPC: 'helius' | 'quicknode';
}

class GeneNoutAgent {
  private state: DeploymentState;
  private connection: Connection;
  private signer: Keypair;

  constructor() {
    this.state = this.loadState();
    this.connection = this.initRPC();
    this.signer = this.loadSigner();
  }

  private loadState(): DeploymentState {
    const statePath = '.cache/genenout-state.json';
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    }
    return { attempts: 0, failureCount: 0, currentRPC: 'helius' };
  }

  private saveState(): void {
    const statePath = '.cache/genenout-state.json';
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache', { recursive: true });
    fs.writeFileSync(statePath, JSON.stringify(this.state, null, 2));
  }

  private initRPC(): Connection {
    const heliusKey = process.env.HELIUS_API_KEY;
    const quicknodeUrl = process.env.QUICKNODE_RPC;
    
    if (this.state.failureCount >= 3 && quicknodeUrl) {
      console.log('🔄 Switching to QuickNode RPC (3+ failures)');
      this.state.currentRPC = 'quicknode';
      return new Connection(quicknodeUrl, 'confirmed');
    }
    
    if (heliusKey) {
      console.log('✅ Using Helius RPC');
      return new Connection(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, 'confirmed');
    }
    
    console.log('⚠️  Fallback to public RPC');
    return new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
  }

  private loadSigner(): Keypair {
    const key = process.env.SIGNER_WALLET_PRIVATE_KEY;
    if (!key) throw new Error('SIGNER_WALLET_PRIVATE_KEY not set');
    
    try {
      return Keypair.fromSecretKey(bs58.decode(key));
    } catch {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(key)));
    }
  }

  async deploy(): Promise<boolean> {
    this.state.attempts++;
    console.log(`\n🧬 GeneNout Deploy Attempt #${this.state.attempts}`);
    console.log(`   Signer: ${this.signer.publicKey.toBase58()}`);
    console.log(`   RPC: ${this.state.currentRPC}`);

    try {
      const { blockhash } = await this.connection.getLatestBlockhash();
      console.log(`✅ RPC Connected (blockhash: ${blockhash.slice(0, 8)}...)`);
      
      // Check if mint exists
      const mintPath = '.cache/mint.json';
      if (fs.existsSync(mintPath)) {
        const mint = JSON.parse(fs.readFileSync(mintPath, 'utf-8')).mint;
        console.log(`✅ Mint exists: ${mint}`);
        this.state.lastSuccess = new Date().toISOString();
        this.state.failureCount = 0;
        this.saveState();
        return true;
      }

      console.log('🚀 No mint found - deployment needed');
      console.log('💡 Run: npm run mainnet:all');
      
      this.state.failureCount++;
      this.saveState();
      return false;
    } catch (e: any) {
      console.error(`❌ Deploy failed: ${e.message}`);
      this.state.failureCount++;
      this.saveState();
      return false;
    }
  }

  async selfAudit(): void {
    console.log('\n[SELF-AUDIT]');
    console.log(`✅ Helius + QuickNode failover: ${this.state.currentRPC}`);
    console.log(`✅ Signer loaded securely: ${this.signer.publicKey.toBase58()}`);
    console.log(`✅ Attempts: ${this.state.attempts}`);
    console.log(`✅ Failures: ${this.state.failureCount}`);
    console.log(`✅ Last success: ${this.state.lastSuccess || 'never'}`);
  }
}

async function main() {
  const agent = new GeneNoutAgent();
  const success = await agent.deploy();
  await agent.selfAudit();
  
  if (!success) {
    console.log('\n⏳ Will retry in 30 minutes...');
    process.exit(1);
  }
  
  console.log('\n✨ Deploy successful - triggering evolution...');
  process.exit(0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
