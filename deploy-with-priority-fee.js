const { Connection, Keypair, PublicKey, Transaction, SystemProgram, ComputeBudgetProgram } = require('@solana/web3.js');
const { createInitializeMint2Instruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, MINT_SIZE } = require('@solana/spl-token');
const fs = require('fs');
require('dotenv').config();

const JUPITER_PROXY = new PublicKey('GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp');

async function getPriorityFee(connection) {
  try {
    const response = await fetch(connection.rpcEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getPriorityFeeEstimate',
        params: [{ accountKeys: [JUPITER_PROXY.toString()] }]
      })
    });
    const data = await response.json();
    return data.result?.priorityFeeEstimate || 1000;
  } catch {
    return 1000;
  }
}

async function getPayerFromCache() {
  const cachePath = '.cache/user_auth.json';
  if (fs.existsSync(cachePath)) {
    const keyData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(keyData));
  }
  throw new Error('No payer keypair found in .cache/user_auth.json');
}

async function deployWithPriorityFee(ownerAddress) {
  const connection = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
  
  console.log('🚀 DEPLOYING WITH PRIORITY FEE\n');
  
  const payer = await getPayerFromCache();
  const owner = new PublicKey(ownerAddress);
  const mint = Keypair.generate();
  
  console.log('Payer:', payer.publicKey.toString());
  console.log('Owner:', ownerAddress);
  console.log('Mint:', mint.publicKey.toString());
  
  const priorityFee = await getPriorityFee(connection);
  console.log('Priority Fee:', priorityFee, 'microlamports\n');
  
  // Step 1: Create mint
  console.log('1️⃣ Creating mint...');
  const rent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  
  const createTx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }))
    .add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
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
  
  createTx.feePayer = payer.publicKey;
  createTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  createTx.sign(payer, mint);
  
  const sig1 = await connection.sendRawTransaction(createTx.serialize());
  await connection.confirmTransaction(sig1);
  console.log(`✅ Mint: https://explorer.solana.com/tx/${sig1}\n`);
  
  // Step 2: Create ATA and mint
  console.log('2️⃣ Minting supply...');
  const ata = await getAssociatedTokenAddress(mint.publicKey, owner, false, TOKEN_2022_PROGRAM_ID);
  
  const mintTx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }))
    .add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
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
  
  mintTx.feePayer = payer.publicKey;
  mintTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  mintTx.sign(payer);
  
  const sig2 = await connection.sendRawTransaction(mintTx.serialize());
  await connection.confirmTransaction(sig2);
  console.log(`✅ Minted: https://explorer.solana.com/tx/${sig2}\n`);
  
  const deployment = {
    mint: mint.publicKey.toString(),
    ata: ata.toString(),
    owner: ownerAddress,
    payer: payer.publicKey.toString(),
    jupiterUrl: `https://jup.ag/swap/SOL-${mint.publicKey.toString()}`,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('.cache/live-deployment.json', JSON.stringify(deployment, null, 2));
  
  console.log('🎉 LIVE DEPLOYMENT COMPLETE!\n');
  console.log('Mint:', deployment.mint);
  console.log('Jupiter:', deployment.jupiterUrl);
  
  return deployment;
}

const [ownerAddress] = process.argv.slice(2);
if (!ownerAddress) {
  console.log('Usage: node deploy-with-priority-fee.js <owner_address>');
  process.exit(1);
}

deployWithPriorityFee(ownerAddress).catch(console.error);