const fetch = require('node-fetch');
require('dotenv').config();

class HeliusTransactionsV2 {
  constructor() {
    this.rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  }

  async getTransactionsForAddress(address, options = {}) {
    const params = [address, {
      transactionDetails: options.full ? 'full' : 'signatures',
      sortOrder: options.chronological ? 'asc' : 'desc',
      limit: options.limit || 100,
      ...options.filters && { filters: options.filters },
      ...options.paginationToken && { paginationToken: options.paginationToken }
    }];

    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransactionsForAddress',
        params
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.result || { data: [] };
  }

  async getSuccessfulTransactions(address, timeRange = {}) {
    return this.getTransactionsForAddress(address, {
      filters: {
        status: 'succeeded',
        ...timeRange.start && timeRange.end && {
          blockTime: { gte: timeRange.start, lte: timeRange.end }
        }
      }
    });
  }

  async getFirstTransactions(address, limit = 10) {
    return this.getTransactionsForAddress(address, {
      chronological: true,
      full: true,
      limit
    });
  }
}

async function main() {
  const helius = new HeliusTransactionsV2();
  const [command, address, ...args] = process.argv.slice(2);

  if (!address) {
    console.log('Usage: node helius-transactions-v2.js <command> <address> [args]');
    console.log('Commands: recent, successful, first, range');
    return;
  }

  try {
    switch (command) {
      case 'recent':
        const recent = await helius.getTransactionsForAddress(address);
        console.log(`Recent transactions: ${recent.data.length}`);
        break;

      case 'successful':
        const successful = await helius.getSuccessfulTransactions(address);
        console.log(`Successful transactions: ${successful.data.length}`);
        break;

      case 'first':
        const first = await helius.getFirstTransactions(address, 5);
        console.log(`First transactions: ${first.data.length}`);
        break;

      case 'range':
        const [start, end] = args;
        const range = await helius.getSuccessfulTransactions(address, {
          start: parseInt(start),
          end: parseInt(end)
        });
        console.log(`Range transactions: ${range.data.length}`);
        break;

      default:
        console.log('Unknown command');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) main();