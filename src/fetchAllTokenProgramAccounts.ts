import { fetchAllProgramAccountsPaginated } from './utils/heliusProgram';
import { getSecureConfig } from './utils/securityConfig';

// SPL Token Program (legacy)
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

async function main() {
  const config = getSecureConfig();
  const rpcUrl = config.rpcUrlWithKey;
  if (!rpcUrl.includes('helius')) {
    console.warn('HELIUS_API_KEY not set; using non-Helius RPC. Pagination may not be supported.');
  }

  let total = 0;
  await fetchAllProgramAccountsPaginated({
    rpcUrl,
    programId: TOKEN_PROGRAM,
    limitPerPage: 1000,
    commitment: 'confirmed',
    // Example: filter by dataSize for token mints (82) or token accounts (165)
    // filters: [{ dataSize: 165 }],
    async onPage(accounts, pageIndex) {
      total += accounts.length;
      console.log(`Page ${pageIndex}: fetched ${accounts.length} accounts (running total: ${total})`);
    },
  });

  console.log(`Done. Total accounts fetched from Token Program: ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
