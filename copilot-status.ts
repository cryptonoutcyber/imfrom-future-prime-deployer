#!/usr/bin/env ts-node
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

function findAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  )[0];
}

async function checkStatus() {
  console.log('🚀 OMEGA PRIME I-WHO-ME COPILOT - DEPLOYMENT STATUS\n');
  console.log('==============================');
  
  const connection = new Connection(process.env.RPC_URL!, 'confirmed');
  const mintCachePath = path.join(__dirname, '.cache/mint.json');
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBKEY!);

  console.log('📊 Configuration:');
  console.log(`   RPC: ${process.env.RPC_URL}`);
  console.log(`   Relayer: ${process.env.RELAYER_PUBKEY}`);
  console.log(`   Treasury: ${treasuryPubkey.toBase58()}`);
  console.log(`   Authority Mode: ${process.env.AUTHORITY_MODE}\n`);

  if (!fs.existsSync(mintCachePath)) {
    console.log('❌ No mint found. Run deployment to create token.');
    console.log('\n🌱 Next Steps:');
    console.log('   1. Create Mint (generates new token)');
    console.log('   2. Mint Initial Supply (1B tokens)');
    console.log('   3. Set Metadata (name, symbol)');
    console.log('   4. Lock Authorities (irreversible)\n');
    return;
  }

  const mint = new PublicKey(JSON.parse(fs.readFileSync(mintCachePath, 'utf-8')).mint);
  console.log(`✅ Mint Address: ${mint.toBase58()}`);
  console.log(`   🌐 Explorer: https://explorer.solana.com/address/${mint.toBase58()}\n`);

  try {
    const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    console.log(`✅ Mint Info:`);
    console.log(`   Supply: ${Number(mintInfo.supply) / 1e9} tokens`);
    console.log(`   Decimals: ${mintInfo.decimals}`);
    console.log(`   Mint Authority: ${mintInfo.mintAuthority?.toBase58() || 'null (locked)'}`);
    console.log(`   Freeze Authority: ${mintInfo.freezeAuthority?.toBase58() || 'null (locked)'}\n`);

    const treasuryAta = findAssociatedTokenAddress(treasuryPubkey, mint);
    try {
      const ataAccount = await getAccount(connection, treasuryAta, 'confirmed', TOKEN_2022_PROGRAM_ID);
      console.log(`✅ Treasury ATA: ${treasuryAta.toBase58()}`);
      console.log(`   Balance: ${Number(ataAccount.amount) / 1e9} tokens\n`);
    } catch {
      console.log(`⚠️  Treasury ATA not found or not initialized\n`);
    }

    console.log('🎯 Deployment Status: ACTIVE');
    console.log('✨ Token is live on Solana mainnet!\n');
  } catch (e: any) {
    console.error(`❌ Error: ${e.message}\n`);
  }

  console.log('==============================');
}

checkStatus().catch(console.error);
