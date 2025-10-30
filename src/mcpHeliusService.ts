import { createMCPHeliusAgent, MCPHeliusAgent } from './utils/mcpHeliusAgent.js';

export class MCPHeliusService {
  private agent: MCPHeliusAgent;

  constructor() {
    this.agent = createMCPHeliusAgent();
  }

  async analyzeWallet(address: string) {
    try {
      const [tokens, nfts, transactions] = await Promise.all([
        this.agent.getTokenAccounts(address),
        this.agent.getNFTs(address),
        this.agent.getTransactions(address, 5)
      ]);

      return {
        address,
        tokenCount: tokens.length,
        nftCount: nfts.length || 0,
        recentTransactions: transactions.length || 0,
        analysis: {
          hasTokens: tokens.length > 0,
          hasNFTs: (nfts.length || 0) > 0,
          isActive: (transactions.length || 0) > 0
        }
      };
    } catch (error) {
      throw new Error(`Wallet analysis failed: ${error.message}`);
    }
  }

  async validateAllowlist(addresses: string[]) {
    const results = [];
    for (const address of addresses) {
      try {
        const analysis = await this.analyzeWallet(address);
        results.push({ ...analysis, status: 'allowed' });
      } catch (error) {
        results.push({ 
          address, 
          status: 'denied', 
          reason: error.message 
        });
      }
    }
    return results;
  }
}