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
  
  if (data.result?.value) {
    const account = data.result.value;
    console.log('Account Info:');
    console.log('  Address:', address);
    console.log('  Balance:', account.lamports / 1e9, 'SOL');
    console.log('  Owner:', account.owner);
    console.log('  Executable:', account.executable);
    console.log('  Rent Epoch:', account.rentEpoch);
    console.log('  Data Size:', account.space || account.data[0]?.length || 0, 'bytes');
    return account;
  } else {
    console.log('Account not found or error:', data.error?.message);
    return null;
  }
}

const [address] = process.argv.slice(2);
if (!address) {
  console.log('Usage: node helius-get-account.js <address>');
  process.exit(1);
}

getAccountInfo(address);