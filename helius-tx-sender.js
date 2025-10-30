const { Connection, Transaction, SystemProgram, Keypair, PublicKey, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

class HeliusTxSender {
  constructor() {
    this.connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`);
  }

  async sendSOL(fromKeypair, toAddress, amount) {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: amount * 1e9
      })
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [fromKeypair]);
  }

  async sendRawTransaction(serializedTx) {
    return await this.connection.sendRawTransaction(serializedTx);
  }
}

async function main() {
  const sender = new HeliusTxSender();
  const [action, ...args] = process.argv.slice(2);

  switch (action) {
    case 'send-sol':
      const [privateKey, toAddress, amount] = args;
      const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
      const sig = await sender.sendSOL(keypair, toAddress, parseFloat(amount));
      console.log(`Transaction: ${sig}`);
      break;
    
    case 'send-raw':
      const [rawTx] = args;
      const signature = await sender.sendRawTransaction(Buffer.from(rawTx, 'base64'));
      console.log(`Transaction: ${signature}`);
      break;
    
    default:
      console.log('Usage: node helius-tx-sender.js <send-sol|send-raw> [args]');
  }
}

if (require.main === module) main();