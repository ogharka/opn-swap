import addresses from './abis/addresses.json';

// Base token config — addresses filled from deploy output
export const TOKENS = [
  { symbol: 'OPN',  name: 'OPN',         color: '#6C5CE7', bg: '#EEF0FF', price: 0.12,  decimals: 18, address: 'NATIVE' },
  { symbol: 'USDC', name: 'USD Coin',     color: '#2775CA', bg: '#EBF3FC', price: 1.00,  decimals: 6,  address: addresses.contracts.USDC  },
  { symbol: 'WETH', name: 'Wrapped ETH',  color: '#627EEA', bg: '#EDF0FD', price: 3200,  decimals: 18, address: addresses.contracts.WETH  },
  { symbol: 'DAI',  name: 'Dai',          color: '#F5AC37', bg: '#FEF6E7', price: 1.00,  decimals: 18, address: addresses.contracts.DAI   },
  { symbol: 'USDT', name: 'Tether USD',   color: '#26A17B', bg: '#E8F7F3', price: 1.00,  decimals: 6,  address: addresses.contracts.USDT  },
];
