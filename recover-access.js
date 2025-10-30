const { Connection, PublicKey } = require('@solana/web3.js');
const contracts = require('./contract_addresses.json');
require('dotenv').config();

class AccessRecovery {
  constructor() {
    this.connection = new Connection('https://cosmopolitan-divine-glade.solana-mainnet.quiknode.pro/7841a43ec7721a54d6facb64912eca1f1dc7237e');
  }

  async checkProgramAccess(address) {
    try {
      const pubkey = new PublicKey(address);
      const info = await this.connection.getAccountInfo(pubkey);
      
      if (!info) return { address, status: 'NOT_DEPLOYED', accessible: false };
      
      return {
        address,
        status: 'EXISTS',
        accessible: info.executable,
        owner: info.owner.toString(),
        lamports: info.lamports / 1e9,
        isProgram: info.executable
      };
    } catch (error) {
      return { address, status: 'ERROR', error: error.message };
    }
  }

  async checkVoteAccount(address) {
    try {
      const voteAccounts = await this.connection.getVoteAccounts();
      const found = [...voteAccounts.current, ...voteAccounts.delinquent]
        .find(v => v.nodePubkey === address || v.votePubkey === address);
      
      return found ? { address, status: 'ACTIVE_VALIDATOR', credits: found.epochCredits } : null;
    } catch (error) {
      return null;
    }
  }

  async scanAllContracts() {
    const addresses = contracts.omega_prime_addresses.all_addresses_list;
    const results = {
      deployed: [],
      notDeployed: [],
      programs: [],
      validators: []
    };

    console.log('🔍 Scanning all contract addresses...\n');

    for (const address of addresses) {
      const result = await this.checkProgramAccess(address);
      const voteCheck = await this.checkVoteAccount(address);

      if (voteCheck) results.validators.push(voteCheck);
      if (result.status === 'EXISTS') {
        results.deployed.push(result);
        if (result.isProgram) results.programs.push(result);
      } else {
        results.notDeployed.push(result);
      }

      console.log(`${result.status === 'EXISTS' ? '✅' : '❌'} ${address.slice(0, 8)}...`);
    }

    return results;
  }

  generateRecoveryReport(results) {
    console.log('\n📊 RECOVERY REPORT\n');
    console.log(`Total Addresses: ${contracts.omega_prime_addresses.all_addresses_list.length}`);
    console.log(`Deployed: ${results.deployed.length}`);
    console.log(`Not Deployed: ${results.notDeployed.length}`);
    console.log(`Programs: ${results.programs.length}`);
    console.log(`Validators: ${results.validators.length}`);

    if (results.deployed.length > 0) {
      console.log('\n✅ ACCESSIBLE ACCOUNTS:');
      results.deployed.forEach(acc => {
        console.log(`  ${acc.address}`);
        console.log(`    SOL: ${acc.lamports}`);
        console.log(`    Owner: ${acc.owner}`);
      });
    }

    console.log('\n💡 RECOMMENDATIONS:');
    if (results.deployed.length === 0) {
      console.log('  • No contracts deployed - need to redeploy');
      console.log('  • Check if you have the private keys');
      console.log('  • Verify wallet access');
    }
    if (results.validators.length === 0) {
      console.log('  • No active validators found');
      console.log('  • Check validator node status');
      console.log('  • Verify vote account setup');
    }
  }
}

async function main() {
  const recovery = new AccessRecovery();
  const results = await recovery.scanAllContracts();
  recovery.generateRecoveryReport(results);
}

if (require.main === module) main();