const { Connection } = require('@solana/web3.js');
require('dotenv').config();

async function verifyGenesis() {
  const connection = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
  
  const genesisHash = await connection.getGenesisHash();
  const expectedHash = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
  
  console.log('Genesis Hash:', genesisHash);
  console.log('Expected:', expectedHash);
  console.log('Match:', genesisHash === expectedHash ? '✅' : '❌');
  
  if (genesisHash === expectedHash) {
    console.log('\n✅ Connected to Solana Mainnet-Beta');
  } else {
    console.log('\n⚠️  Different network detected');
  }
  
  return genesisHash;
}

verifyGenesis();