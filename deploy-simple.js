const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { createInitializeMint2Instruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, MINT_SIZE } = require('@solana/spl-token');
const fs = require('fs');
require('dotenv').config();

async function deploy(ownerAddress, payerPrivateKey) {
  const connection = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
  
  console.log('🚀 SIMPLE TOKEN DEPLOYMENT\n');
  
  const payer = Keypair.fromSecretKey(Buffer.from(JSON.parse(payerPrivateKey)));
  const owner = new PublicKey(ownerAddress);
  const mint = Keypair.generate();
  
  console.log('Payer:', payer.publicKey.toString());
  console.log('Owner:', ownerAddress);
  console.log('Mint:', mint.publicKey.toString(), '\n');
  
  const balance = await connection.getBalance(payer.publicKey);
  console.log('Payer Balance:', balance / 1e9, 'SOL\n');
  
  if (balance < 10000000) {
    console.log('❌ Insufficient balance. Need ~0.01 SOL');
    return;
  }
  
  // Create mint
  console.log('1️⃣ Creating mint...');
  const rent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  
  const tx1 = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: rent,
      space: MINT_SIZE,
      programId: TOKEN_2022_PROGRAM_ID
    }),
    createInitializeMint2Instruction(mint.publicKey, 9, owner, owner, TOKEN_2022_PROGRAM_ID)
  );
  
  tx1.feePayer = payer.publicKey;
  tx1.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx1.sign(payer, mint);
  
  const sig1 = await connection.sendRawTransaction(tx1.serialize());
  await connection.confirmTransaction(sig1);
  console.log(`✅ https://explorer.solana.com/tx/${sig1}\n`);
  
  // Mint tokens
  console.log('2️⃣ Minting tokens...');
  const ata = await getAssociatedTokenAddress(mint.publicKey, owner, false, TOKEN_2022_PROGRAM_ID);
  
  const tx2 = new Transaction().add(
    createAssociatedTokenAccountInstruction(payer.publicKey, ata, owner, mint.publicKey, TOKEN_2022_PROGRAM_ID),
    createMintToInstruction(mint.publicKey, ata, owner, 1000000000n * 10n**9n, [], TOKEN_2022_PROGRAM_ID)
  );
  
  tx2.feePayer = payer.publicKey;
  tx2.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx2.sign(payer);
  
  const sig2 = await connection.sendRawTransaction(tx2.serialize());
  await connection.confirmTransaction(sig2);
  console.log(`✅ https://explorer.solana.com/tx/${sig2}\n`);
  
  console.log('🎉 DEPLOYMENT COMPLETE!\n');
  console.log('Mint:', mint.publicKey.toString());
  console.log('ATA:', ata.toString());
  console.log('Jupiter:', `https://jup.ag/swap/SOL-${mint.publicKey.toString()}`);
}

const [ownerAddress, payerKey] = process.argv.slice(2);
if (!ownerAddress || !payerKey) {
  console.log('Usage: node deploy-simple.js <owner> <payer_private_key_json>');
  console.log('Example: node deploy-simple.js 4gL... \'[1,2,3,...]\'');
  process.exit(1);
}

deploy(ownerAddress, payerKey).catch(console.error);