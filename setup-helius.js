const fs = require('fs');
const path = require('path');

function setupHeliusApiKey() {
  const envPath = path.join(__dirname, '.env');
  
  console.log('🔑 Helius API Key Setup');
  console.log('Please get your API key from: https://dev.helius.xyz/');
  console.log('');
  console.log('Current .env status:');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasValidKey = envContent.includes('HELIUS_API_KEY=') && 
                       !envContent.includes('your_helius_api_key_here');
    
    console.log(hasValidKey ? '✅ API key configured' : '❌ API key needs setup');
    
    if (!hasValidKey) {
      console.log('');
      console.log('To configure:');
      console.log('1. Get API key from https://dev.helius.xyz/');
      console.log('2. Replace "your_helius_api_key_here" in .env with your actual key');
    }
  } else {
    console.log('❌ .env file not found');
    console.log('Run: cp .env.sample .env');
  }
}

if (require.main === module) setupHeliusApiKey();