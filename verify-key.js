const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

const keyData = JSON.parse(fs.readFileSync('.cache/user_auth.json', 'utf8'));
const keypair = Keypair.fromSecretKey(new Uint8Array(keyData));

console.log('🔑 PRIVATE KEY FOUND!\n');
console.log('Public Key:', keypair.publicKey.toString());
console.log('\nMatches:');
console.log('  CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ:', 
  keypair.publicKey.toString() === 'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ' ? '✅ MASTER CONTROLLER' : '❌');
console.log('  8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y:', 
  keypair.publicKey.toString() === '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y' ? '✅ RELAYER' : '❌');
console.log('  9HUvuQHBHkihcrhiucdYFjk1q4jUgozakoYsubYrHiJS:', 
  keypair.publicKey.toString() === '9HUvuQHBHkihcrhiucdYFjk1q4jUgozakoYsubYrHiJS' ? '✅ SECONDARY' : '❌');
console.log('  GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp:', 
  keypair.publicKey.toString() === 'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp' ? '✅ PROGRAM' : '❌');