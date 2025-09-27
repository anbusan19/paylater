# PayLater Smart Contract Integration Guide

This guide explains how to integrate the PayLater frontend with your smart contracts in the `pyusd-contract` directory.

## Environment Setup

1. **Configure Wallet Addresses** in `.env`:
```env
VITE_MERCHANT_WALLET_ADDRESS="0x..." # Merchant's wallet address
VITE_LIQUIDITY_WALLET_ADDRESS="0x..." # Liquidity pool wallet address
```

2. **Update Contract Addresses** in `src/utils/contractConfig.ts`:
```typescript
export const CONTRACT_CONFIG = {
  PAYMENT_CONTRACT_ADDRESS: "0x...", // Your deployed Payment Contract
  EMI_MANAGER_CONTRACT_ADDRESS: "0x...", // Your deployed EMI Manager
  LIQUIDITY_POOL_CONTRACT_ADDRESS: "0x...", // Your deployed Liquidity Pool
  // ... other addresses
};
```

## Payment Flows

### 1. Pay Now Option (Instant Payment)
**Flow**: User MetaMask → Merchant Wallet

**Implementation**: `src/utils/paymentService.ts` - `processInstantPayment()`

**What happens**:
1. User connects MetaMask wallet
2. System checks PYUSD balance
3. Direct PYUSD transfer from user to merchant
4. Transaction confirmed on blockchain

### 2. Pay with EMI Option
**Flow**: Liquidity Pool → Merchant Wallet (User pays EMI later)

**Implementation**: `src/utils/paymentService.ts` - `processEMIPayment()`

**What happens**:
1. User connects wallet and gets verified
2. EMI eligibility check via `EMIService.verifyEligibility()`
3. User selects EMI plan (3, 6, or 12 months)
4. Liquidity pool transfers full amount to merchant
5. EMI contract created for user's monthly payments

## Smart Contract Integration Points

### 1. Update Contract ABIs
Replace the placeholder ABIs in `src/contracts/contractInterfaces.ts` with your actual contract ABIs from the compiled contracts.

### 2. Payment Contract Integration
```typescript
// In paymentService.ts, update the encodePYUSDTransfer method
// to call your Payment Contract instead of direct PYUSD transfer
```

### 3. EMI Manager Integration
```typescript
// In emiService.ts, update verifyEligibility method
// to call your EMI Manager contract's eligibility function
```

### 4. Liquidity Pool Integration
```typescript
// In paymentService.ts, update processEMIPayment method
// to call your Liquidity Pool contract's transfer function
```

## Required Contract Functions

Your smart contracts should implement these functions:

### Payment Contract
- `processInstantPayment(address merchant, uint256 amount)`
- `getPaymentHistory(address user)`

### EMI Manager Contract
- `verifyEligibility(address user) returns (bool, uint256, uint256)`
- `createEMIPlan(address user, address merchant, uint256 amount, uint256 term)`
- `getUserEMIPlans(address user) returns (address[])`

### Liquidity Pool Contract
- `transferToMerchant(address merchant, uint256 amount, address emiContract)`
- `getPoolBalance() returns (uint256)`
- `addLiquidity(uint256 amount)`

## Testing

1. **Local Development**: Use Hardhat local network or Ganache
2. **Testnet**: Deploy to Sepolia testnet for testing
3. **MetaMask**: Ensure MetaMask is connected to the correct network

## File Structure

```
src/
├── utils/
│   ├── contractConfig.ts     # Contract addresses and network config
│   ├── paymentService.ts     # Payment processing logic
│   └── emiService.ts         # EMI-related functions
├── contracts/
│   └── contractInterfaces.ts # Contract ABIs and interfaces
└── components/
    ├── InstantPaymentPage.tsx # Instant payment UI
    ├── EMIPaymentPage.tsx     # EMI payment UI
    └── Header.tsx             # Wallet connection
```

## Next Steps

1. Deploy your smart contracts from `pyusd-contract` directory
2. Update the contract addresses in `contractConfig.ts`
3. Replace placeholder ABIs with actual contract ABIs
4. Test the integration on testnet
5. Update environment variables for production

## Security Considerations

- Always validate user inputs
- Check contract return values
- Handle transaction failures gracefully
- Implement proper error handling
- Use secure RPC endpoints
- Validate wallet connections

## Support

For integration issues, check:
1. Contract deployment status
2. Network configuration
3. MetaMask connection
4. Transaction gas limits
5. PYUSD contract address for your network