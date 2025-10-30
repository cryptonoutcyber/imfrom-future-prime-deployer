const fetch = require('node-fetch');
require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '4fe39d22-5043-40d3-b2a1-dd8968ecf8a6';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

async function getAccountInfo(address) {
  const response = await fetch(HELIUS_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [address, { encoding: 'base64' }]
    })
  });
  
  const data = await response.json();
  return data.result?.value;
}

async function checkMultipleAccounts(addresses) {
  console.log('🔍 CHECKING ACCOUNTS FOR SOL\n');
  
  const funded = [];
  
  for (const address of addresses) {
    const info = await getAccountInfo(address);
    if (info && info.lamports > 0) {
      const sol = info.lamports / 1e9;
      console.log(`✅ ${address}`);
      console.log(`   Balance: ${sol} SOL`);
      console.log(`   Owner: ${info.owner}`);
      
      if (sol >= 0.01) {
        funded.push({ address, sol, owner: info.owner });
      }
    } else {
      console.log(`❌ ${address} - No balance`);
    }
  }
  
  console.log('\n💰 FUNDED ACCOUNTS (>= 0.01 SOL):\n');
  funded.forEach(acc => {
    console.log(`${acc.address}: ${acc.sol} SOL`);
  });
  
  return funded;
}

const addresses = [
  '4gLAGDEHs6sJ6AMmLdAwCUx9NPmPLxoMCZ3yiKyAyQ1m',
  '83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri',
  '8cRrU1NzNpjL3k2BwjW3VixAcX6VFc29KHr4KZg8cs2Y',
  'CvQZZ23qYDWF2RUpxYJ8y9K4skmuvYEEjH7fK58jtipQ',
  'GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp',
  '9HUvuQHBHkihcrhiucdYFjk1q4jUgozakoYsubYrHiJS'
];

checkMultipleAccounts(addresses);