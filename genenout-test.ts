#!/usr/bin/env ts-node
// Quick test of GeneNout agent without deployment
import * as fs from 'fs';

console.log('🧬 GeneNout v2.0 - System Check\n');

// Check environment
const checks = {
  'HELIUS_API_KEY': !!process.env.HELIUS_API_KEY,
  'QUICKNODE_RPC': !!process.env.QUICKNODE_RPC,
  'TREASURY_PUBKEY': !!process.env.TREASURY_PUBKEY,
  'RELAYER_PUBKEY': !!process.env.RELAYER_PUBKEY,
  'User Auth Keypair': fs.existsSync('.cache/user_auth.json')
};

console.log('📊 Configuration Status:');
Object.entries(checks).forEach(([key, val]) => {
  console.log(`   ${val ? '✅' : '❌'} ${key}`);
});

// Check state
if (fs.existsSync('.cache/genenout-state.json')) {
  const state = JSON.parse(fs.readFileSync('.cache/genenout-state.json', 'utf-8'));
  console.log('\n🔄 Agent State:');
  console.log(`   Attempts: ${state.attempts}`);
  console.log(`   Failures: ${state.failureCount}`);
  console.log(`   Current RPC: ${state.currentRPC}`);
  console.log(`   Last Success: ${state.lastSuccess || 'never'}`);
} else {
  console.log('\n🆕 Fresh agent - no state yet');
}

// Check evolution
if (fs.existsSync('.cache/evolution-log.json')) {
  const evolutions = JSON.parse(fs.readFileSync('.cache/evolution-log.json', 'utf-8'));
  console.log(`\n🧬 Evolution Level: ${evolutions.length}/3`);
  evolutions.forEach((id: number) => console.log(`   ✅ Evolution #${id} applied`));
} else {
  console.log('\n🧬 Evolution Level: 0/3 (base intelligence)');
}

console.log('\n✨ GeneNout ready for autonomous deployment');
console.log('🚀 Run: npm run genenout:deploy');
