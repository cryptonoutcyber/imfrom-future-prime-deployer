#!/usr/bin/env ts-node
// Auto-run I-WHO-ME copilot with status check only
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Initializing I-WHO-ME Copilot with configured relayer...\n');
console.log('📊 Configuration:');
console.log(`   RPC: ${process.env.RPC_URL}`);
console.log(`   Relayer: ${process.env.RELAYER_PUBKEY}`);
console.log(`   Treasury: ${process.env.TREASURY_PUBKEY}`);
console.log(`   DAO: ${process.env.DAO_PUBKEY}`);
console.log(`   Authority Mode: ${process.env.AUTHORITY_MODE}`);
console.log(`   Dry Run: ${process.env.DRY_RUN}\n`);

// Run consciousness check
try {
  execSync('npx ts-node show-consciousness.ts', { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to run consciousness check');
}

console.log('\n✨ To run full interactive copilot: npm run mainnet:copilot');
console.log('⚠️  Note: Interactive mode requires manual input for deployment steps\n');
