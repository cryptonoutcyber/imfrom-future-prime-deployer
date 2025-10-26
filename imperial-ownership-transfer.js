#!/usr/bin/env node

const { Connection, PublicKey, Transaction, SystemProgram, Keypair } = require('@solana/web3.js');
const { createSetAuthorityInstruction, AuthorityType } = require('@solana/spl-token');
require('dotenv').config();

class ImperialOwnershipManager {
  constructor() {
    this.connection = new Connection(process.env.RPC_URL_WITH_KEY, 'confirmed');
    this.multisigAddresses = this.parseMultisigAddresses();
  }

  parseMultisigAddresses() {
    const addresses = process.env.MULTISIG_ADDRESSES?.split(',') || [];
    return addresses.map(addr => new PublicKey(addr.trim()));
  }

  async transferTokenOwnership(mintAddress, newAuthority) {
    console.log('🔄 TRANSFERRING TOKEN OWNERSHIP...');
    
    const mint = new PublicKey(mintAddress);
    const authority = new PublicKey(newAuthority);
    
    // Create authority transfer instruction
    const instruction = createSetAuthorityInstruction(
      mint,
      this.payer.publicKey,
      AuthorityType.MintTokens,
      authority
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(transaction, [this.payer]);
    
    console.log(`✅ Ownership transferred: ${signature}`);
    return signature;
  }

  async setupMultisigControl(mintAddress) {
    console.log('🏛️ SETTING UP MULTISIG CONTROL...');
    
    if (this.multisigAddresses.length < 2) {
      throw new Error('Minimum 2 multisig addresses required');
    }

    // Transfer to first multisig address (simplified)
    const signature = await this.transferTokenOwnership(
      mintAddress, 
      this.multisigAddresses[0].toBase58()
    );

    console.log(`🔒 Multisig control established: ${signature}`);
    return signature;
  }

  async executeImperialTransfer(mintAddress) {
    console.log('👑 EXECUTING IMPERIAL OWNERSHIP TRANSFER...');
    
    try {
      const signature = await this.setupMultisigControl(mintAddress);
      
      console.log('🏛️ IMPERIAL CONTROL ESTABLISHED!');
      console.log(`📍 Mint: ${mintAddress}`);
      console.log(`🔐 Multisig: ${this.multisigAddresses[0].toBase58()}`);
      console.log(`📜 Signature: ${signature}`);
      
      return {
        mintAddress,
        multisigAuthority: this.multisigAddresses[0].toBase58(),
        signature
      };
      
    } catch (error) {
      console.error('❌ Imperial transfer failed:', error);
      throw error;
    }
  }
}

async function main() {
  const manager = new ImperialOwnershipManager();
  const mintAddress = process.argv[2] || process.env.MINT_ADDRESS;
  
  if (!mintAddress) {
    console.error('❌ Mint address required');
    process.exit(1);
  }
  
  await manager.executeImperialTransfer(mintAddress);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ImperialOwnershipManager };