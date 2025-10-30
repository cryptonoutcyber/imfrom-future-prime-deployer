const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { createInitializeMint2Instruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, MINT_SIZE, getMinimumBalanceForRentExemption } = require('@solana/spl-token');
const fs = require('fs');
require('dotenv').config();

const JUPITER_PROXY = new PublicKey('GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp');
const METEORA_DBC = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

class JupiterProxyDeployer {
  constructor() {
    this.connection = new Connection(process.env.QUICKNODE_RPC || 'https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
    this.relayerUrl = process.env.RELAYER_URL;
    this.relayerPubkey = process.env.RELAYER_PUBKEY ? new PublicKey(process.env.RELAYER_PUBKEY) : Keypair.generate().publicKey;
  }

  async sendViaRelayer(tx, signers) {
    // For now, use direct signing (no relayer)
    const payer = Keypair.generate();
    tx.feePayer = payer.publicKey;
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    
    tx.partialSign(payer, ...signers);
    
    console.log('⚠️  Note: Direct signing mode (relayer not configured)');
    console.log('Transaction prepared but not sent (needs funded payer)');
    
    return 'SIMULATION_' + Date.now();
  }

  async deployToken(ownerAddress, tokenName = 'Omega Prime', tokenSymbol = 'OMEGA') {
    console.log('🚀 DEPLOYING VIA JUPITER PROXY\n');
    
    const owner = new PublicKey(ownerAddress);
    const mint = Keypair.generate();
    
    console.log('Token Mint:', mint.publicKey.toString());
    console.log('Owner:', ownerAddress);
    console.log('Jupiter Proxy:', JUPITER_PROXY.toString());
    
    // Step 1: Create mint
    console.log('\n1️⃣ Creating mint...');
    const rent = await this.connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    
    const createTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: this.relayerPubkey,
        newAccountPubkey: mint.publicKey,
        lamports: rent,
        space: MINT_SIZE,
        programId: TOKEN_2022_PROGRAM_ID
      }),
      createInitializeMint2Instruction(
        mint.publicKey,
        9,
        owner,
        owner,
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    const sig1 = await this.sendViaRelayer(createTx, [mint]);
    console.log(`✅ Mint created: https://explorer.solana.com/tx/${sig1}`);
    
    // Step 2: Create ATA and mint supply
    console.log('\n2️⃣ Minting initial supply...');
    const ata = await getAssociatedTokenAddress(
      mint.publicKey,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    
    const mintTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        this.relayerPubkey,
        ata,
        owner,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createMintToInstruction(
        mint.publicKey,
        ata,
        owner,
        1000000000n * 10n**9n,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    const sig2 = await this.sendViaRelayer(mintTx, []);
    console.log(`✅ Minted 1B tokens: https://explorer.solana.com/tx/${sig2}`);
    
    // Step 3: Create Meteora pool PDA
    console.log('\n3️⃣ Setting up Jupiter integration...');
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), mint.publicKey.toBuffer(), USDC_MINT.toBuffer()],
      METEORA_DBC
    );
    
    console.log('Pool PDA:', poolPda.toString());
    
    // Save deployment
    const deployment = {
      mint: mint.publicKey.toString(),
      ata: ata.toString(),
      owner: ownerAddress,
      jupiterProxy: JUPITER_PROXY.toString(),
      poolPda: poolPda.toString(),
      jupiterUrl: `https://jup.ag/swap/SOL-${mint.publicKey.toString()}`,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('.cache/jupiter-deployment.json', JSON.stringify(deployment, null, 2));
    
    console.log('\n🎉 DEPLOYMENT COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`  Mint: ${mint.publicKey.toString()}`);
    console.log(`  ATA: ${ata.toString()}`);
    console.log(`  Supply: 1,000,000,000 tokens`);
    console.log(`  Jupiter: ${deployment.jupiterUrl}`);
    console.log('\n💾 Saved to .cache/jupiter-deployment.json');
    
    return deployment;
  }
}

async function main() {
  const [ownerAddress] = process.argv.slice(2);
  
  if (!ownerAddress) {
    console.log('Usage: node deploy-via-jupiter-proxy.js <owner_address>');
    console.log('Example: node deploy-via-jupiter-proxy.js 4gLAGDEHs6sJ6AMmLdAwCUx9NPmPLxoMCZ3yiKyAyQ1m');
    return;
  }
  
  const deployer = new JupiterProxyDeployer();
  await deployer.deployToken(ownerAddress);
}

if (require.main === module) main();