// Fallback addresses for testing (use these if env vars don't load)
const FALLBACK_MERCHANT_ADDRESS = '0xF746C249955f7516A601E309764241590486b509';
const FALLBACK_LIQUIDITY_ADDRESS = '0xF746C249955f7516A601E309764241590486b509';

// Contract configuration and addresses
export const CONTRACT_CONFIG = {
  MERCHANT_WALLET_ADDRESS: import.meta.env.VITE_MERCHANT_WALLET_ADDRESS || FALLBACK_MERCHANT_ADDRESS,
  LIQUIDITY_WALLET_ADDRESS: import.meta.env.VITE_LIQUIDITY_WALLET_ADDRESS || FALLBACK_LIQUIDITY_ADDRESS,
  // Using Sepolia testnet for testing
  PYUSD_CONTRACT_ADDRESS: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9', // PYUSD on Sepolia testnet
  // Add your deployed contract addresses here
  PAYMENT_CONTRACT_ADDRESS: '', // Your Payment Contract
  EMI_MANAGER_CONTRACT_ADDRESS: '', // Your EMI Manager Contract
  LIQUIDITY_POOL_CONTRACT_ADDRESS: '', // Your Liquidity Pool Contract
  USER_PROFILE_CONTRACT_ADDRESS: '', // Your User Profile Contract
};

// Debug: Log environment variables
console.log('Environment Variables Debug:');
console.log('VITE_MERCHANT_WALLET_ADDRESS:', import.meta.env.VITE_MERCHANT_WALLET_ADDRESS);
console.log('VITE_LIQUIDITY_WALLET_ADDRESS:', import.meta.env.VITE_LIQUIDITY_WALLET_ADDRESS);
console.log('Using fallback addresses:', !import.meta.env.VITE_MERCHANT_WALLET_ADDRESS);
console.log('Final CONTRACT_CONFIG:', CONTRACT_CONFIG);

// Network configuration - Using Sepolia for testing
export const NETWORK_CONFIG = {
  chainId: '0xaa36a7', // Sepolia testnet
  chainName: 'Sepolia Test Network',
  rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'SEP',
    decimals: 18,
  },
};

// For mainnet (when ready for production)
export const MAINNET_CONFIG = {
  chainId: '0x1', // Ethereum mainnet
  chainName: 'Ethereum Mainnet',
  rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
  blockExplorerUrls: ['https://etherscan.io'],
  PYUSD_CONTRACT_ADDRESS: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // PYUSD on Ethereum mainnet
};