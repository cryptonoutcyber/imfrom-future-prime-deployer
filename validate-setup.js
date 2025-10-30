#!/usr/bin/env node

require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');

async function validateImperialSetup() {
    console.log('🏛️ IMPERIAL EMPIRE SETUP VALIDATION');
    console.log('===================================');
    
    const connection = new Connection(
        process.env.RPC_URL_WITH_KEY || process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
        'confirmed'
    );
    
    let errors = [];
    let warnings = [];
    
    // Check API Keys
    console.log('\n🔑 API KEYS:');
    if (process.env.HELIUS_API_KEY) {
        console.log('✅ Helius API Key: Configured');
    } else {
        warnings.push('Helius API Key not configured');
        console.log('⚠️  Helius API Key: Missing');
    }
    
    if (process.env.QUICKNODE_RPC) {
        console.log('✅ QuickNode RPC: Configured');
    } else {
        console.log('ℹ️  QuickNode RPC: Optional (not configured)');
    }
    
    // Check Treasury
    console.log('\n💰 TREASURY:');
    if (process.env.TREASURY_PUBKEY) {
        try {
            const treasuryKey = new PublicKey(process.env.TREASURY_PUBKEY);
            const balance = await connection.getBalance(treasuryKey);
            console.log(`✅ Treasury Address: ${treasuryKey.toBase58()}`);
            console.log(`💰 Balance: ${balance / 1e9} SOL`);
            
            if (balance < 100000000) { // 0.1 SOL
                warnings.push('Treasury balance low (< 0.1 SOL)');
            }
        } catch (e) {
            errors.push('Invalid treasury public key');
            console.log('❌ Treasury Address: Invalid');
        }
    } else {
        errors.push('Treasury public key not configured');
        console.log('❌ Treasury Address: Missing');
    }
    
    // Check Controller
    console.log('\n👑 CONTROLLER:');
    if (process.env.CONTROLLER_PUBKEY) {
        try {
            const controllerKey = new PublicKey(process.env.CONTROLLER_PUBKEY);
            console.log(`✅ Controller Address: ${controllerKey.toBase58()}`);
        } catch (e) {
            errors.push('Invalid controller public key');
            console.log('❌ Controller Address: Invalid');
        }
    } else {
        warnings.push('Controller public key not configured');
        console.log('⚠️  Controller Address: Missing');
    }
    
    // Check Allowlist
    console.log('\n🛡️ ALLOWLIST:');
    if (process.env.ALLOWLIST_ADDRESSES) {
        const addresses = process.env.ALLOWLIST_ADDRESSES.split(',');
        console.log(`✅ Allowlist Count: ${addresses.length} addresses`);
        
        let validCount = 0;
        for (const addr of addresses) {
            try {
                new PublicKey(addr.trim());
                validCount++;
            } catch (e) {
                errors.push(`Invalid allowlist address: ${addr}`);
            }
        }
        console.log(`✅ Valid Addresses: ${validCount}/${addresses.length}`);
    } else {
        warnings.push('Allowlist not configured');
        console.log('⚠️  Allowlist: Not configured');
    }
    
    // Check Multisig
    console.log('\n🔐 MULTISIG:');
    if (process.env.MULTISIG_ADDRESSES) {
        const addresses = process.env.MULTISIG_ADDRESSES.split(',');
        console.log(`✅ Multisig Count: ${addresses.length} addresses`);
        
        if (addresses.length < 2) {
            warnings.push('Multisig requires minimum 2 addresses');
        }
    } else {
        warnings.push('Multisig not configured');
        console.log('⚠️  Multisig: Not configured');
    }
    
    // Check Security Settings
    console.log('\n🔒 SECURITY:');
    console.log(`✅ Authority Mode: ${process.env.AUTHORITY_MODE || 'null'}`);
    console.log(`✅ Dry Run: ${process.env.DRY_RUN || 'false'}`);
    console.log(`✅ Trading Enabled: ${process.env.TRADING_ENABLED || 'false'}`);
    console.log(`✅ MEV Protection: ${process.env.MEV_PROTECTION || 'false'}`);
    
    // Summary
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log('=====================');
    
    if (errors.length === 0 && warnings.length === 0) {
        console.log('🎉 PERFECT SETUP! Ready for imperial deployment!');
        return true;
    }
    
    if (errors.length > 0) {
        console.log('❌ ERRORS (Must fix):');
        errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS (Recommended):');
        warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (errors.length === 0) {
        console.log('\n🚀 Setup valid! You can proceed with deployment.');
        return true;
    } else {
        console.log('\n🛠️  Fix errors before deployment.');
        return false;
    }
}

validateImperialSetup().catch(console.error);