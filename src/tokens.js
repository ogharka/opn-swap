export const OPN_NETWORK = {
  chainId: '0x3D8',
  chainName: 'OPN Testnet',
  nativeCurrency: { name: 'OPN', symbol: 'OPN', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.iopn.tech'],
  blockExplorerUrls: ['https://testnet.iopn.tech'],
};

export const TOKENS = [
  { symbol: 'OPN',  name: 'OPN',           color: '#6C5CE7', bg: '#EEF0FF', price: 0.12,   balance: 100.00, decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin',       color: '#2775CA', bg: '#EBF3FC', price: 1.00,   balance: 0,      decimals: 6  },
  { symbol: 'WETH', name: 'Wrapped ETH',    color: '#627EEA', bg: '#EDF0FD', price: 3200,   balance: 0,      decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped BTC',    color: '#F7931A', bg: '#FEF3E7', price: 67000,  balance: 0,      decimals: 8  },
  { symbol: 'DAI',  name: 'Dai',            color: '#F5AC37', bg: '#FEF6E7', price: 1.00,   balance: 0,      decimals: 18 },
  { symbol: 'USDT', name: 'Tether USD',     color: '#26A17B', bg: '#E8F7F3', price: 1.00,   balance: 0,      decimals: 6  },
];

export const ROUTES = ['Direct', 'Via USDC', 'Via WETH', 'Split route'];
