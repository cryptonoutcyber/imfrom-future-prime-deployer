const { Connection, PublicKey } = require('@solana/web3.js');
const { getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
require('dotenv').config();

class ProgramAuthorityChecker {
  constructor() {
    this.connection = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
  }

  async checkMintAuthority(mintAddress) {
    try {
      const mint = new PublicKey(mintAddress);
      
      // Try Token-2022 first
      let mintInfo;
      let programId = TOKEN_2022_PROGRAM_ID;
      
      try {
        mintInfo = await getMint(this.connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
      } catch {
        // Try regular Token Program
        mintInfo = await getMint(this.connection, mint, 'confirmed', TOKEN_PROGRAM_ID);
        programId = TOKEN_PROGRAM_ID;
      }
      
      return {
        mint: mintAddress,
        programId: programId.toString(),
        mintAuthority: mintInfo.mintAuthority?.toString() || 'null',
        freezeAuthority: mintInfo.freezeAuthority?.toString() || 'null',
        supply: mintInfo.supply.toString(),
        decimals: mintInfo.decimals,
        isInitialized: mintInfo.isInitialized
      };
    } catch (error) {
      return { mint: mintAddress, error: error.message };
    }
  }

  async checkProgramUpgradeAuthority(programAddress) {
    try {
      const program = new PublicKey(programAddress);
      const accountInfo = await this.connection.getAccountInfo(program);
      
      if (!accountInfo || !accountInfo.executable) {
        return { program: programAddress, error: 'Not an executable program' };
      }
      
      // For upgradeable programs
      if (accountInfo.owner.toString() === 'BPFLoaderUpgradeab1e11111111111111111111111') {
        const [programDataAddress] = PublicKey.findProgramAddressSync(
          [program.toBuffer()],
          new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
        );
        
        const programData = await this.connection.getAccountInfo(programDataAddress);
        if (programData && programData.data.length > 45) {
          const upgradeAuthority = new PublicKey(programData.data.slice(13, 45));
          return {
            program: programAddress,
            upgradeable: true,
            upgradeAuthority: upgradeAuthority.toString(),
            programDataAddress: programDataAddress.toString()
          };
        }
      }
      
      return {
        program: programAddress,
        upgradeable: false,
        owner: accountInfo.owner.toString()
      };
    } catch (error) {
      return { program: programAddress, error: error.message };
    }
  }
}

async function main() {
  const checker = new ProgramAuthorityChecker();
  const [type, address] = process.argv.slice(2);
  
  if (!address) {
    console.log('Usage: node check-program-authority.js <mint|program> <address>');
    console.log('\nExamples:');
    console.log('  node check-program-authority.js mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    console.log('  node check-program-authority.js program GL6kwZxTaXUXMGAvmmNZSXxANnwtPmKCHprHBM82zYXp');
    return;
  }
  
  console.log('🔍 CHECKING AUTHORITY\n');
  
  if (type === 'mint') {
    const result = await checker.checkMintAuthority(address);
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`Mint: ${result.mint}`);
      console.log(`Program: ${result.programId}`);
      console.log(`Mint Authority: ${result.mintAuthority}`);
      console.log(`Freeze Authority: ${result.freezeAuthority}`);
      console.log(`Supply: ${result.supply}`);
      console.log(`Decimals: ${result.decimals}`);
    }
  } else if (type === 'program') {
    const result = await checker.checkProgramUpgradeAuthority(address);
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`Program: ${result.program}`);
      console.log(`Upgradeable: ${result.upgradeable}`);
      if (result.upgradeable) {
        console.log(`Upgrade Authority: ${result.upgradeAuthority}`);
        console.log(`Program Data: ${result.programDataAddress}`);
      } else {
        console.log(`Owner: ${result.owner}`);
      }
    }
  } else {
    console.log('Invalid type. Use "mint" or "program"');
  }
}

if (require.main === module) main();