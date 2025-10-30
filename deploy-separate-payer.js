const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { createInitializeMint2Instruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, MINT_SIZE } = require('@solana/spl-token');
const bs58 = require('bs58');
const fs = require('fs');
require('dotenv').config();

async function deploySeparatePayer(ownerAddress, signerKey, feePayerKey) {
  const connection = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
  
  console.log('🚀 DEPLOYING WITH SEPARATE FEE PAYER\n');
  
  // Parse keys
  const signerKeypair = Keypair.fromSecretKey(bs58.default.decode(signerKey));
  const feePayerKeypair = Keypair.fromSecretKey(bs58.default.decode(feePayerKey));
  const owner = new PublicKey(ownerAddress);
  const mint = Keypair.generate();
  
  console.log('Signer:', signerKeypair.publicKey.toString());
  console.log('Fee Payer:', feePayerKeypair.publicKey.toString());
  console.log('Owner:', ownerAddress);
  console.log('Mint:', mint.publicKey.toString(), '\n');
  
  const feePayerBalance = await connection.getBalance(feePayerKeypair.publicKey);
  console.log('Fee Payer Balance:', feePayerBalance / 1e9, 'SOL\n');
  
  if (feePayerBalance < 10000000) {
    console.log('❌ Insufficient balance for fee payer');
    return;
  }
  
  // Step 1: Create mint
  console.log('1️⃣ Creating mint...');
  const rent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  
  const tx1 = new Transaction({
    feePayer: feePayerKeypair.publicKey,
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash
  });
  
  tx1.add(
    SystemProgram.createAccount({
      fromPubkey: feePayerKeypair.publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: rent,
      space: MINT_SIZE,
      programId: TOKEN_2022_PROGRAM_ID
    }),
    createInitializeMint2Instruction(mint.publicKey, 9, owner, owner, TOKEN_2022_PROGRAM_ID)
  );
  
  tx1.sign(feePayerKeypair, mint);
  
  const sig1 = await connection.sendRawTransaction(tx1.serialize());
  await connection.confirmTransaction(sig1);
  console.log(`✅ https://explorer.solana.com/tx/${sig1}\n`);
  
  // Step 2: Create ATA and mint
  console.log('2️⃣ Minting tokens...');
  const ata = await getAssociatedTokenAddress(mint.publicKey, owner, false, TOKEN_2022_PROGRAM_ID);
  
  const tx2 = new Transaction({
    feePayer: feePayerKeypair.publicKey,
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash
  });
  
  tx2.add(
    createAssociatedTokenAccountInstruction(
      feePayerKeypair.publicKey,
      ata,
      owner,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    createMintToInstruction(mint.publicKey, ata, owner, 1000000000n * 10n**9n, [], TOKEN_2022_PROGRAM_ID)
  );
  
  tx2.sign(feePayerKeypair);
  
  const sig2 = await connection.sendRawTransaction(tx2.serialize());
  await connection.confirmTransaction(sig2);
  console.log(`✅ https://explorer.solana.com/tx/${sig2}\n`);
  
  const deployment = {
    mint: mint.publicKey.toString(),
    ata: ata.toString(),
    owner: ownerAddress,
    signer: signerKeypair.publicKey.toString(),
    feePayer: feePayerKeypair.publicKey.toString(),
    jupiterUrl: `https://jup.ag/swap/SOL-${mint.publicKey.toString()}`,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('.cache/deployed-token.json', JSON.stringify(deployment, null, 2));
  
  console.log('🎉 DEPLOYMENT COMPLETE!\n');
  console.log('Mint:', deployment.mint);
  console.log('Jupiter:', deployment.jupiterUrl);
  console.log('\n💾 Saved to .cache/deployed-token.json');
}

const [ownerAddress, signerKey, feePayerKey] = process.argv.slice(2);

if (!ownerAddress || !signerKey || !feePayerKey) {
  console.log('Usage: node deploy-separate-payer.js <owner> <signer_key> <fee_payer_key>');
  console.log('\nExample:');
  console.log('  node deploy-separate-payer.js 4gL... <signer_base58> <payer_base58>');
  process.exit(1);
}

deploySeparatePayer(ownerAddress, signerKey, feePayerKey).catch(console.error);