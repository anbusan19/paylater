import { CONTRACT_CONFIG, NETWORK_CONFIG } from './contractConfig';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export class PaymentService {
  private static async getWeb3Provider() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }
    return window.ethereum;
  }

  private static async checkNetwork() {
    const provider = await this.getWeb3Provider();
    const chainId = await provider.request({ method: 'eth_chainId' });
    
    // Check if we're on Sepolia testnet
    if (chainId !== NETWORK_CONFIG.chainId) {
      try {
        console.log('Switching to Sepolia network...');
        // Try to switch to Sepolia
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          // If the chain hasn't been added to MetaMask, add it
          if (switchError.code === 4902) {
            console.log('Adding Sepolia network to MetaMask...');
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [NETWORK_CONFIG],
            });
          } else {
            throw switchError;
          }
        }
        
        // Verify the switch was successful
        const newChainId = await provider.request({ method: 'eth_chainId' });
        if (newChainId !== NETWORK_CONFIG.chainId) {
          throw new Error('Failed to switch to Sepolia network');
        }
      } catch (error: any) {
        throw new Error(`Network switch failed: ${error.message || 'Please switch to Sepolia testnet in MetaMask'}`);
      }
    }
    
    return chainId;
  }

  /**
   * Pay Now Option: Direct PYUSD transfer from user to merchant
   */
  static async processInstantPayment(
    userAddress: string,
    amount: number
  ): Promise<PaymentResult> {
    try {
      const provider = await this.getWeb3Provider();
      await this.checkNetwork();

      const merchantAddress = CONTRACT_CONFIG.MERCHANT_WALLET_ADDRESS;
      console.log('Merchant address from config:', merchantAddress);
      console.log('Full CONTRACT_CONFIG:', CONTRACT_CONFIG);
      
      if (!merchantAddress) {
        throw new Error(`Merchant wallet address not configured. Current value: "${merchantAddress}"`);
      }

      // Convert amount to Wei (USDC/PYUSD has 6 decimals)
      const amountInWei = Math.floor(amount * 1000000).toString();

      // Estimate gas for the transaction
      const gasEstimate = await provider.request({
        method: 'eth_estimateGas',
        params: [{
          to: CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS,
          from: userAddress,
          data: this.encodePYUSDTransfer(merchantAddress, amountInWei)
        }]
      });

      // Get current gas price with EIP-1559 parameters
      const feeData = await provider.request({ method: 'eth_gasPrice' });
      
      // USDC/PYUSD transfer transaction
      const transactionParameters = {
        to: CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS,
        from: userAddress,
        data: this.encodePYUSDTransfer(merchantAddress, amountInWei),
        gas: gasEstimate,
        maxFeePerGas: feeData,
      };

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      return {
        success: true,
        transactionHash: txHash,
      };
    } catch (error: any) {
      console.error('Instant payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  }

  /**
   * EMI Option: Transfer from liquidity pool to merchant
   */
  static async processEMIPayment(
    userAddress: string,
    amount: number,
    emiPlan: any
  ): Promise<PaymentResult> {
    try {
      const provider = await this.getWeb3Provider();
      await this.checkNetwork();

      const merchantAddress = CONTRACT_CONFIG.MERCHANT_WALLET_ADDRESS;
      const liquidityAddress = CONTRACT_CONFIG.LIQUIDITY_WALLET_ADDRESS;
      
      if (!merchantAddress || !liquidityAddress) {
        throw new Error('Wallet addresses not configured');
      }

      // This would typically interact with your EMI Manager contract
      // For now, we'll simulate the liquidity pool transfer
      const amountInWei = Math.floor(amount * 1000000).toString();

      // Call your EMI Manager contract to:
      // 1. Verify user eligibility
      // 2. Create EMI schedule
      // 3. Transfer from liquidity pool to merchant
      const transactionParameters = {
        to: CONTRACT_CONFIG.EMI_MANAGER_CONTRACT_ADDRESS || CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS,
        from: userAddress,
        data: this.encodeEMISetup(merchantAddress, liquidityAddress, amountInWei, emiPlan),
        gas: '0x7A120', // Higher gas for contract interaction
        gasPrice: '0x09184e72a000',
      };

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      return {
        success: true,
        transactionHash: txHash,
      };
    } catch (error: any) {
      console.error('EMI payment failed:', error);
      return {
        success: false,
        error: error.message || 'EMI setup failed',
      };
    }
  }

  /**
   * Encode PYUSD transfer function call
   */
  private static encodePYUSDTransfer(to: string, amount: string): string {
    // ERC-20 transfer function signature: transfer(address,uint256)
    const functionSignature = '0xa9059cbb';
    
    // Pad addresses and amounts to 32 bytes
    const paddedTo = to.replace('0x', '').padStart(64, '0');
    const paddedAmount = parseInt(amount).toString(16).padStart(64, '0');
    
    return functionSignature + paddedTo + paddedAmount;
  }

  /**
   * Encode EMI setup function call
   */
  private static encodeEMISetup(
    merchant: string,
    liquidity: string,
    amount: string,
    emiPlan: any
  ): string {
    // This would encode your custom EMI contract function
    // For now, return a basic transfer encoding
    return this.encodePYUSDTransfer(merchant, amount);
  }

  /**
   * Get PYUSD balance for an address
   */
  static async getPYUSDBalance(address: string): Promise<number> {
    try {
      const provider = await this.getWeb3Provider();
      
      console.log('Getting PYUSD balance for:', address);
      console.log('PYUSD Contract Address:', CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS);
      
      // Ensure address is properly formatted
      const formattedAddress = address.toLowerCase();
      
      // ERC-20 balanceOf function call
      const data = '0x70a08231000000000000000000000000' + formattedAddress.replace('0x', '');
      
      const result = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS,
          data: data,
        }, 'latest'],
      });

      console.log('Raw balance result:', result);
      
      // Check if result is valid
      if (!result || result === '0x' || result === '0x0') {
        console.warn('Empty or invalid balance result from contract');
        return 0;
      }
      
      // Convert from Wei to PYUSD (6 decimals)
      const balanceWei = BigInt(result);
      const balance = Number(balanceWei) / 1_000_000; // PYUSD uses 6 decimals
      
      console.log('Balance in Wei:', balanceWei.toString());
      console.log('Balance in PYUSD:', balance);
      
      return balance;
    } catch (error) {
      console.error('Failed to get PYUSD balance:', error);
      console.error('Error details:', error);
      return 0;
    }
  }

  /**
   * Check if user has sufficient PYUSD balance
   */
  static async checkSufficientBalance(address: string, amount: number): Promise<boolean> {
    const balance = await this.getPYUSDBalance(address);
    return balance >= amount;
  }

  /**
   * Verify PYUSD contract is accessible and get contract info
   */
  static async verifyPYUSDContract(): Promise<{ isValid: boolean; error?: string; info?: any }> {
    try {
      const provider = await this.getWeb3Provider();
      
      // Check if contract exists by getting code
      const code = await provider.request({
        method: 'eth_getCode',
        params: [CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS, 'latest'],
      });

      console.log('Contract code length:', code.length);
      
      if (!code || code === '0x' || code.length <= 2) {
        return { 
          isValid: false, 
          error: 'No contract found at this address. Contract may not be deployed on Sepolia.' 
        };
      }

      // Try to get contract name (if it implements name() function)
      const nameData = '0x06fdde03'; // name() function signature
      
      const nameResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS,
          data: nameData,
        }, 'latest'],
      });

      // Try to get symbol
      const symbolData = '0x95d89b41'; // symbol() function signature
      
      const symbolResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS,
          data: symbolData,
        }, 'latest'],
      });

      // Try to get decimals
      const decimalsData = '0x313ce567'; // decimals() function signature
      
      const decimalsResult = await provider.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS,
          data: decimalsData,
        }, 'latest'],
      });

      console.log('Contract name result:', nameResult);
      console.log('Contract symbol result:', symbolResult);
      console.log('Contract decimals result:', decimalsResult);

      return { 
        isValid: true, 
        info: {
          hasCode: true,
          nameResult,
          symbolResult,
          decimalsResult
        }
      };
    } catch (error: any) {
      console.error('Contract verification failed:', error);
      return { isValid: false, error: error.message };
    }
  }
}