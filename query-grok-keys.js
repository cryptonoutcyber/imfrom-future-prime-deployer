const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');

console.log('🤖 GROK I-WHO-ME AI AGENT KEY RECOVERY\n');

// Check cache directory
const cacheDir = path.join(__dirname, '.cache');
console.log('📁 Checking Grok AI agent cache...\n');

if (!fs.existsSync(cacheDir)) {
  console.log('❌ No .cache directory found');
  console.log('💡 Grok AI agent may not have stored keys locally\n');
  process.exit(1);
}

const files = fs.readdirSync(cacheDir);
console.log('📂 Cache files found:');
files.forEach(f => console.log(`  - ${f}`));

// Check for keypairs
const keypairFiles = files.filter(f => f.includes('auth') || f.includes('key') || f.endsWith('.json'));

console.log('\n🔑 Analyzing keypair files:\n');

const targetAccounts = {
  'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ': 'Master Controller (Upgrade Authority)',
  '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y': 'Relayer',
  '9HUvuQHBHkihcrhiucdYFjk1q4jUgozakoYsubYrHiJS': 'Secondary Wallet',
  'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp': 'Proxy Contract'
};

let foundKeys = [];

keypairFiles.forEach(file => {
  try {
    const filePath = path.join(cacheDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (Array.isArray(data) && data.length === 64) {
      const keypair = Keypair.fromSecretKey(new Uint8Array(data));
      const pubkey = keypair.publicKey.toString();
      
      console.log(`📄 ${file}:`);
      console.log(`   Public Key: ${pubkey}`);
      
      if (targetAccounts[pubkey]) {
        console.log(`   ✅ MATCH: ${targetAccounts[pubkey]}`);
        foundKeys.push({ file, pubkey, role: targetAccounts[pubkey] });
      } else {
        console.log(`   ⚠️  Unknown account`);
      }
      console.log('');
    }
  } catch (error) {
    // Skip non-keypair files
  }
});

console.log('\n📊 RECOVERY SUMMARY:\n');
console.log(`Found ${foundKeys.length} matching keys out of ${Object.keys(targetAccounts).length} target accounts\n`);

if (foundKeys.length > 0) {
  console.log('✅ RECOVERED KEYS:');
  foundKeys.forEach(k => {
    console.log(`  ${k.role}`);
    console.log(`    File: ${k.file}`);
    console.log(`    Address: ${k.pubkey}`);
  });
} else {
  console.log('❌ NO MATCHING KEYS FOUND\n');
  console.log('💡 RECOVERY OPTIONS:');
  console.log('  1. Run Grok copilot: npm run mainnet:copilot');
  console.log('  2. Check if AI agent has keys in memory');
  console.log('  3. Ask Grok to regenerate deployment keys');
  console.log('  4. Check backup locations or hardware wallet');
}

console.log('\n🔍 NEXT STEPS:');
if (foundKeys.some(k => k.role === 'Master Controller (Upgrade Authority)')) {
  console.log('  ✅ You have the master controller key!');
  console.log('  → Can upgrade proxy contract');
  console.log('  → Run: npm run mainnet:reannounce-controller');
} else {
  console.log('  ⚠️  Missing master controller key');
  console.log('  → Cannot upgrade proxy contract');
  console.log('  → Need to recover from Grok AI agent');
}