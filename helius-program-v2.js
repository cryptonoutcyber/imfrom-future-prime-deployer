const fetch = require('node-fetch');
require('dotenv').config();

async function getProgramAccountsV2(programId, filters = []) {
  const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getProgramAccounts',
      params: [{
        programId,
        encoding: 'base64',
        filters,
        commitment: 'confirmed'
      }]
    })
  });

  const data = await response.json();
  return data.result || [];
}

async function main() {
  const [programId] = process.argv.slice(2);
  
  if (!programId) {
    console.log('Usage: node helius-program-v2.js <program_id>');
    console.log('Example: node helius-program-v2.js TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    return;
  }

  try {
    const accounts = await getProgramAccountsV2(programId);
    console.log(`Found ${accounts.length} accounts for program ${programId}`);
    console.log(JSON.stringify(accounts.slice(0, 3), null, 2)); // Show first 3
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) main();