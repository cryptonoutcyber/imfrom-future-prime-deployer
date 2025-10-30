#!/usr/bin/env ts-node
import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const keypairPath = path.join(__dirname, '.cache/user_auth.json');
const keypairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairJson));

console.log('🔑 USER AUTH KEYPAIR STATUS:\n');
console.log(`   Public Key: ${keypair.publicKey.toBase58()}`);
console.log(`   Location: .cache/user_auth.json`);
console.log(`   Status: ✅ Valid keypair loaded\n`);
console.log('🌟 This keypair is used for signing deployment transactions');
console.log('💡 Relayer will pay fees, this key just signs operations\n');
