const { Connection, Keypair, PublicKey, Transaction, VersionedTransaction, TransactionMessage } = require('@solana/web3.js');
const fetch = require('node-fetch');
require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '4fe39d22-5043-40d3-b2a1-dd8968ecf8a6';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

class HeliusTransactionBuilder {
  constructor() {
    this.connection = new Connection(HELIUS_RPC);
  }

  async searchAssets(ownerAddress) {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'searchAssets',
        params: {
          ownerAddress,
          tokenType: 'fungible',
          displayOptions: { showNativeBalance: true }
        }
      })
    });
    
    const data = await response.json();
    return data.result;
  }

  async getPriorityFee(accounts) {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getPriorityFeeEstimate',
        params: [{ accountKeys: accounts }]
      })
    });
    
    const data = await response.json();
    return data.result?.priorityFeeEstimate || 1000;
  }

  async buildAndSendTransaction(instructions, payer) {
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    
    const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash,
      instructions
    }).compileToV0Message();
    
    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([payer]);
    
    const signature = await this.connection.sendTransaction(transaction);
    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    
    return signature;
  }

  async sendRawTransaction(serializedTx) {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [serializedTx, { encoding: 'base64' }]
      })
    });
    
    const data = await response.json();
    return data.result;
  }
}

async function main() {
  const helius = new HeliusTransactionBuilder();
  const [command, address] = process.argv.slice(2);
  
  if (!address) {
    console.log('Usage: node helius-build-send-tx.js <search|fee> <address>');
    console.log('\nCommands:');
    console.log('  search <address>  - Search assets owned by address');
    console.log('  fee <address>     - Get priority fee for address');
    return;
  }
  
  try {
    switch (command) {
      case 'search':
        console.log('🔍 Searching assets...\n');
        const assets = await helius.searchAssets(address);
        console.log('Total Assets:', assets?.total || 0);
        console.log('Native Balance:', assets?.nativeBalance?.lamports / 1e9, 'SOL');
        if (assets?.items?.length > 0) {
          console.log('\nTokens:');
          assets.items.forEach((item, i) => {
            console.log(`${i + 1}. ${item.content?.metadata?.name || 'Unknown'}`);
            console.log(`   Mint: ${item.id}`);
            console.log(`   Balance: ${item.token_info?.balance || 0}`);
          });
        }
        break;
      
      case 'fee':
        console.log('💰 Getting priority fee...\n');
        const fee = await helius.getPriorityFee([address]);
        console.log('Priority Fee:', fee, 'microlamports');
        console.log('In SOL:', fee / 1e9, 'SOL');
        break;
      
      default:
        console.log('Unknown command');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) main();