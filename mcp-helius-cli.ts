#!/usr/bin/env ts-node
import { MCPHeliusService } from './src/mcpHeliusService.js';
import { config } from 'dotenv';

config();

async function main() {
  const service = new MCPHeliusService();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: ts-node mcp-helius-cli.ts <command> [args]');
    console.log('Commands:');
    console.log('  analyze <address>     - Analyze wallet');
    console.log('  validate <addr1,addr2> - Validate allowlist');
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'analyze':
        if (!args[1]) throw new Error('Address required');
        const analysis = await service.analyzeWallet(args[1]);
        console.log(JSON.stringify(analysis, null, 2));
        break;

      case 'validate':
        if (!args[1]) throw new Error('Addresses required');
        const addresses = args[1].split(',');
        const validation = await service.validateAllowlist(addresses);
        console.log(JSON.stringify(validation, null, 2));
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();