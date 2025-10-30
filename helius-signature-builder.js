const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

class HeliusSignatureBuilder {
  constructor() {
    this.connection = new Connection(`https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`);
  }

  async getSignaturesForAddress(address, limit = 10) {
    const pubkey = new PublicKey(address);
    const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit });
    return signatures.filter(sig => !sig.err); // Only successful transactions
  }

  async getTransactionDetails(signature) {
    return await this.connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
  }

  async buildTransactionHistory(walletAddress) {
    const signatures = await this.getSignaturesForAddress(walletAddress);
    const transactions = [];

    for (const sig of signatures) {
      try {
        const tx = await this.getTransactionDetails(sig.signature);
        if (tx) {
          transactions.push({
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            fee: tx.meta?.fee,
            success: !tx.meta?.err
          });
        }
      } catch (error) {
        console.error(`Failed to get transaction ${sig.signature}:`, error.message);
      }
    }

    return transactions;
  }
}

async function main() {
  const builder = new HeliusSignatureBuilder();
  const [walletAddress] = process.argv.slice(2);
  
  if (!walletAddress) {
    console.log('Usage: node helius-signature-builder.js <wallet_address>');
    return;
  }

  try {
    const history = await builder.buildTransactionHistory(walletAddress);
    console.log(`Found ${history.length} signed transactions for wallet`);
    console.log(JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) main();