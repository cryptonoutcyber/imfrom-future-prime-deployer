const bs58 = require('bs58');
const key = bs58.default.decode('3WMmYPa2F7N2R4gFb9vkZkH7ZRm3zhqpJwGNegxgAjpD6J5eqHSY8MCpzZAgRTpnPA4HMV8X3NNPNTxZRPJktCZd');
console.log(JSON.stringify(Array.from(key)));