const bs58 = require('bs58');

const data = {
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "accounts": [
      {"pubkey": "1111iH2XXowNevv9LrNNZvBDqZHqTn78dBUWnsx6dy", "account": {"lamports": 1461600}},
      {"pubkey": "11112UKUGpHw3Ksc5pkiHDcVDoXLmiyehBSn26n8NAE", "account": {"lamports": 1461600}},
      {"pubkey": "111E61yp1MfVeHb6DZNYgVUDU7ij3vfJbF57UwSupm", "account": {"lamports": 2039280}}
    ]
  }
};

console.log('🔍 TOKEN PROGRAM ACCOUNTS FOUND:\n');
console.log(`Total Accounts: ${data.result.accounts.length}`);
console.log('\nFirst 10 Accounts:\n');

data.result.accounts.slice(0, 10).forEach((acc, i) => {
  console.log(`${i + 1}. ${acc.pubkey}`);
  console.log(`   Lamports: ${acc.account.lamports}`);
  console.log(`   SOL: ${acc.account.lamports / 1e9}`);
});

console.log('\n💡 These are token mint accounts on Solana mainnet');
console.log('They contain rent-exempt lamports but are not wallets with transferable SOL');
console.log('\n⚠️  You still need a funded wallet with private key to deploy tokens');