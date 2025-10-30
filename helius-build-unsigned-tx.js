const { Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction } = require('@solana/web3.js');
const { createInitializeMint2Instruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, MINT_SIZE } = require('@solana/spl-token');
const { Keypair } = require('@solana/web3.js');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '4fe39d22-5043-40d3-b2a1-dd8968ecf8a6';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

class HeliusTransactionBuilder {
  constructor() {
    this.connection = new Connection(HELIUS_RPC);
  }

  async buildUnsignedTransaction(ownerAddress, feePayerAddress) {
    console.log('🔨 BUILDING UNSIGNED TRANSACTION\n');
    
    const owner = new PublicKey(ownerAddress);
    const feePayer = new PublicKey(feePayerAddress);
    const mint = Keypair.generate();
    
    console.log('Owner:', ownerAddress);
    console.log('Fee Payer:', feePayerAddress);
    console.log('Mint:', mint.publicKey.toString(), '\n');
    
    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    
    // Build transaction
    const rent = await this.connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    
    const transaction = new Transaction({
      feePayer,
      recentBlockhash: blockhash
    });
    
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: feePayer,
        newAccountPubkey: mint.publicKey,
        lamports: rent,
        space: MINT_SIZE,
        programId: TOKEN_2022_PROGRAM_ID
      }),
      createInitializeMint2Instruction(mint.publicKey, 9, owner, owner, TOKEN_2022_PROGRAM_ID)
    );
    
    // Mint keypair must sign
    transaction.partialSign(mint);
    
    // Serialize for external signing
    const serialized = transaction.serialize({ requireAllSignatures: false }).toString('base64');
    
    console.log('✅ Transaction built');
    console.log('📦 Serialized (base64):', serialized.slice(0, 100) + '...');
    console.log('\n🔑 Required Signers:');
    console.log('  1. Fee Payer:', feePayerAddress);
    console.log('  2. Mint:', mint.publicKey.toString(), '(already signed)');
    
    return {
      transaction: serialized,
      mint: mint.publicKey.toString(),
      feePayer: feePayerAddress,
      owner: ownerAddress,
      blockhash
    };
  }

  async getSignatureStatus(signature) {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignatureStatuses',
        params: [[signature]]
      })
    });
    
    const data = await response.json();
    return data.result?.value?.[0];
  }

  async getSignaturesForAddress(address, limit = 10) {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [address, { limit }]
      })
    });
    
    const data = await response.json();
    return data.result || [];
  }

  async simulateTransaction(serializedTx) {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'simulateTransaction',
        params: [serializedTx]
      })
    });
    
    const data = await response.json();
    return data.result;
  }
}

async function main() {
  const builder = new HeliusTransactionBuilder();
  const [command, ...args] = process.argv.slice(2);
  
  if (!command) {
    console.log('Usage: node helius-build-unsigned-tx.js <command> [args]');
    console.log('\nCommands:');
    console.log('  build <owner> <feePayer>  - Build unsigned transaction');
    console.log('  status <signature>        - Get signature status');
    console.log('  sigs <address>            - Get signatures for address');
    console.log('  simulate <base64_tx>      - Simulate transaction');
    return;
  }
  
  switch (command) {
    case 'build':
      const [owner, feePayer] = args;
      if (!owner || !feePayer) {
        console.log('Usage: build <owner> <feePayer>');
        return;
      }
      const result = await builder.buildUnsignedTransaction(owner, feePayer);
      fs.writeFileSync('.cache/unsigned-tx.json', JSON.stringify(result, null, 2));
      console.log('\n💾 Saved to .cache/unsigned-tx.json');
      break;
    
    case 'status':
      const [sig] = args;
      if (!sig) {
        console.log('Usage: status <signature>');
        return;
      }
      const status = await builder.getSignatureStatus(sig);
      console.log('Signature Status:', JSON.stringify(status, null, 2));
      break;
    
    case 'sigs':
      const [address] = args;
      if (!address) {
        console.log('Usage: sigs <address>');
        return;
      }
      const sigs = await builder.getSignaturesForAddress(address);
      console.log(`Found ${sigs.length} signatures:`);
      sigs.forEach((s, i) => {
        console.log(`${i + 1}. ${s.signature}`);
        console.log(`   Slot: ${s.slot}, Status: ${s.err ? 'Failed' : 'Success'}`);
      });
      break;
    
    case 'simulate':
      const [tx] = args;
      if (!tx) {
        console.log('Usage: simulate <base64_tx>');
        return;
      }
      const sim = await builder.simulateTransaction(tx);
      console.log('Simulation:', JSON.stringify(sim, null, 2));
      break;
    
    default:
      console.log('Unknown command');
  }
}

if (require.main === module) main();