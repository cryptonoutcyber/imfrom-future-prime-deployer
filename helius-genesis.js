const { Connection } = require('@solana/web3.js');
require('dotenv').config();

async function getGenesisHash() {
  const connection = new Connection(`https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`);
  
  try {
    const genesisHash = await connection.getGenesisHash();
    console.log('Genesis Hash:', genesisHash);
    return genesisHash;
  } catch (error) {
    console.error('Error getting genesis hash:', error.message);
  }
}

if (require.main === module) getGenesisHash();