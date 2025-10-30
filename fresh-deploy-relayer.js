const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { createInitializeMint2Instruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class FreshDeployRelayer {
  constructor() {
    this.connection = new Connection(process.env.QUICKNODE_RPC || 'https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
    this.relayerUrl = process.env.RELAYER_URL;
    this.relayerPubkey = new PublicKey(process.env.RELAYER_PUBKEY);
  }

  async sendViaRelayer(tx, signers) {
    tx.feePayer = this.relayerPubkey;
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    
    tx.partialSign(...signers);
    
    const serialized = tx.serialize({ requireAllSignatures: false }).toString('base64');
    
    const response = await fetch(this.relayerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTransactionBase64: serialized })
    });
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    
    console.log(`✅ Tx: https://explorer.solana.com/tx/${result.txSignature}`);
    return result.txSignature;
  }

  async deployFresh(yourAddress) {
    console.log('🚀 FRESH DEPLOYMENT WITH RELAYER\n');
    console.log(`Your Address: ${yourAddress}`);
    console.log(`Relayer: ${this.relayerPubkey.toString()}\n`);

    // Generate new mint
    const mintKeypair = Keypair.generate();
    const yourPubkey = new PublicKey(yourAddress);
    
    console.log('1️⃣ Creating mint...');
    const space = 82;
    const rent = await this.connection.getMinimumBalanceForRentExemption(space);
    
    const createTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: this.relayerPubkey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: rent,
        space,
        programId: TOKEN_2022_PROGRAM_ID
      }),
      createInitializeMint2Instruction(
        mintKeypair.publicKey,
        9,
        yourPubkey,
        yourPubkey,
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    await this.sendViaRelayer(createTx, [mintKeypair]);
    
    console.log(`\n✅ Mint: ${mintKeypair.publicKey.toString()}`);
    
    // Create ATA and mint tokens
    console.log('\n2️⃣ Creating ATA and minting supply...');
    const ata = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      yourPubkey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    
    const mintTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        this.relayerPubkey,
        ata,
        yourPubkey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createMintToInstruction(
        mintKeypair.publicKey,
        ata,
        yourPubkey,
        1000000000n * 10n**9n,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    await this.sendViaRelayer(mintTx, []);
    
    console.log(`✅ ATA: ${ata.toString()}`);
    console.log(`✅ Minted: 1,000,000,000 tokens\n`);
    
    // Save deployment
    const deployment = {
      mint: mintKeypair.publicKey.toString(),
      ata: ata.toString(),
      owner: yourAddress,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('.cache/fresh-deployment.json', JSON.stringify(deployment, null, 2));
    
    console.log('📝 Deployment saved to .cache/fresh-deployment.json');
    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log(`\nYou are the mint authority: ${yourAddress}`);
    console.log('You can now transfer ownership if needed.');
    
    return deployment;
  }
}

async function main() {
  const [yourAddress] = process.argv.slice(2);
  
  if (!yourAddress) {
    console.log('Usage: node fresh-deploy-relayer.js <your_wallet_address>');
    console.log('Example: node fresh-deploy-relayer.js 4gLAGDEHs6sJ6AMmLdAwCUx9NPmPLxoMCZ3yiKyAyQ1m');
    return;
  }
  
  const deployer = new FreshDeployRelayer();
  await deployer.deployFresh(yourAddress);
}

if (require.main === module) main();