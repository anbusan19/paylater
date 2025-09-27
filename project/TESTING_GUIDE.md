# PayLater Sepolia Testing Guide

This guide will help you test the PayLater payment system with 2 PYUSD on Sepolia testnet.

## Prerequisites

### 1. MetaMask Setup
- Install MetaMask browser extension
- Create or import a wallet
- Switch to Sepolia Test Network (the app will help you add it)

### 2. Get Sepolia ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com/) 
- Or [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- Get some Sepolia ETH for gas fees

### 3. Get Test USDC (as PYUSD proxy)
- We're using USDC on Sepolia as a proxy for PYUSD testing
- Contract Address: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- You can get test USDC from [Circle's faucet](https://faucet.circle.com/) or other Sepolia faucets

### 4. Configure Wallet Addresses
Update your `.env` file:
```env
VITE_MERCHANT_WALLET_ADDRESS="0x..." # Your merchant test wallet
VITE_LIQUIDITY_WALLET_ADDRESS="0x..." # Your liquidity pool test wallet
```

## Testing Steps

### 1. Start the Application
```bash
npm run dev
```

### 2. Connect Your Wallet
- Click "Connect Wallet" in the header
- Approve MetaMask connection
- The app will automatically switch to Sepolia testnet

### 3. Test Payment Flow
1. Click "Get Started" on landing page
2. You'll see a test order for 2 PYUSD
3. Select "Pay Now" payment method
4. Click "Proceed to Payment"
5. Connect your wallet if not already connected
6. Confirm the payment in MetaMask

### 4. Verify Transaction
- Check the transaction on [Sepolia Etherscan](https://sepolia.etherscan.io/)
- Verify USDC transfer from your wallet to merchant wallet
- Check wallet balances before and after

## Test Scenarios

### Successful Payment
- Ensure you have at least 2 USDC + gas fees
- Complete the payment flow
- Verify transaction hash and success page

### Insufficient Balance
- Try with less than 2 USDC
- Should show "Insufficient Balance" error
- Test error handling and retry flow

### Network Issues
- Try disconnecting internet during payment
- Test transaction failure scenarios
- Verify error messages and recovery options

## Troubleshooting

### MetaMask Issues
- Make sure you're on Sepolia testnet
- Check if you have sufficient ETH for gas
- Clear MetaMask cache if needed

### Transaction Failures
- Check gas limits (set to 90,000 for ERC-20 transfers)
- Verify contract address is correct
- Ensure wallet has USDC balance

### Network Switching
- App automatically adds Sepolia network
- If manual setup needed:
  - Network Name: Sepolia Test Network
  - RPC URL: https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
  - Chain ID: 11155111
  - Currency Symbol: SEP
  - Block Explorer: https://sepolia.etherscan.io

## Contract Addresses (Sepolia)

- **USDC (PYUSD Proxy)**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Your Merchant Wallet**: Set in `.env`
- **Your Liquidity Pool**: Set in `.env`

## Expected Behavior

1. **Payment Page**: Shows 2 PYUSD test order
2. **Wallet Connection**: Connects to MetaMask on Sepolia
3. **Balance Check**: Verifies USDC balance
4. **Transaction**: Transfers 2 USDC from user to merchant
5. **Success**: Shows transaction hash and success message

## Next Steps

After successful testing:
1. Test EMI flow (currently shows alert)
2. Deploy actual smart contracts
3. Update contract addresses in config
4. Test with real PYUSD on mainnet

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify MetaMask is unlocked and on Sepolia
3. Ensure sufficient test tokens and ETH
4. Check transaction status on Sepolia Etherscan