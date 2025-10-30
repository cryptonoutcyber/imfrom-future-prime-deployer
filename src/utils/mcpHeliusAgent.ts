import { PublicKey } from '@solana/web3.js';
import { heliusGetProgramAccountsV2, HeliusRpcUrl } from './heliusProgram.js';

export interface MCPHeliusConfig {
  apiKey: string;
  rpcUrl: HeliusRpcUrl;
  allowlist: string[];
}

export class MCPHeliusAgent {
  private config: MCPHeliusConfig;

  constructor(config: MCPHeliusConfig) {
    this.config = config;
  }

  private isAllowlisted(address: string): boolean {
    return this.config.allowlist.includes(address);
  }

  async getTokenAccounts(owner: string) {
    if (!this.isAllowlisted(owner)) {
      throw new Error(`Address ${owner} not in allowlist`);
    }

    const response = await heliusGetProgramAccountsV2(this.config.rpcUrl, {
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      filters: [
        { dataSize: 165 },
        { memcmp: { offset: 32, bytes: owner } }
      ]
    });

    return response.result?.accounts || [];
  }

  async getNFTs(owner: string) {
    if (!this.isAllowlisted(owner)) {
      throw new Error(`Address ${owner} not in allowlist`);
    }

    const response = await fetch(`https://api.helius.xyz/v0/addresses/${owner}/nfts?api-key=${this.config.apiKey}`);
    return await response.json();
  }

  async getTransactions(address: string, limit = 10) {
    if (!this.isAllowlisted(address)) {
      throw new Error(`Address ${address} not in allowlist`);
    }

    const response = await fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${this.config.apiKey}&limit=${limit}`);
    return await response.json();
  }
}

export function createMCPHeliusAgent(): MCPHeliusAgent {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    throw new Error('HELIUS_API_KEY environment variable required');
  }

  const allowlistEnv = process.env.ALLOWLIST_ADDRESSES || '';
  const allowlist = allowlistEnv.split(',').filter(addr => addr.trim());

  return new MCPHeliusAgent({
    apiKey,
    rpcUrl: `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
    allowlist
  });
}