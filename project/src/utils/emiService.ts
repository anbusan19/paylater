import { CONTRACT_CONFIG } from './contractConfig';

export interface EMIEligibility {
  isEligible: boolean;
  score: number;
  maxAmount: number;
  availableTerms: number[];
}

export interface EMISchedule {
  totalAmount: number;
  monthlyAmount: number;
  term: number;
  interestRate: number;
  startDate: Date;
  payments: EMIPayment[];
}

export interface EMIPayment {
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export class EMIService {
  /**
   * Verify user eligibility for EMI based on wallet history
   */
  static async verifyEligibility(walletAddress: string): Promise<EMIEligibility> {
    try {
      // In a real implementation, this would:
      // 1. Analyze transaction history
      // 2. Check PYUSD balance and activity
      // 3. Verify against blacklists
      // 4. Calculate credit score based on on-chain data
      
      // Mock implementation for demo
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const isEligible = mockScore >= 70;
      
      return {
        isEligible,
        score: mockScore,
        maxAmount: isEligible ? 5000 : 0,
        availableTerms: isEligible ? [3, 6, 12] : [],
      };
    } catch (error) {
      console.error('EMI eligibility check failed:', error);
      return {
        isEligible: false,
        score: 0,
        maxAmount: 0,
        availableTerms: [],
      };
    }
  }

  /**
   * Calculate EMI plan details
   */
  static calculateEMIPlan(
    principal: number,
    termMonths: number,
    annualInterestRate: number = 0.12
  ): EMISchedule {
    const monthlyRate = annualInterestRate / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    const totalAmount = monthlyPayment * termMonths;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1); // First payment next month
    
    const payments: EMIPayment[] = [];
    for (let i = 0; i < termMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      payments.push({
        dueDate,
        amount: monthlyPayment,
        status: 'pending',
      });
    }

    return {
      totalAmount,
      monthlyAmount: monthlyPayment,
      term: termMonths,
      interestRate: annualInterestRate,
      startDate,
      payments,
    };
  }

  /**
   * Create EMI contract on blockchain
   */
  static async createEMIContract(
    userAddress: string,
    merchantAddress: string,
    schedule: EMISchedule
  ): Promise<{ success: boolean; contractAddress?: string; error?: string }> {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not available');
      }

      // This would interact with your EMI Manager smart contract
      // The contract would:
      // 1. Lock the EMI terms
      // 2. Set up automatic payment schedule
      // 3. Transfer funds from liquidity pool to merchant
      // 4. Create repayment obligations for user

      const provider = window.ethereum;
      
      // Mock contract creation - replace with actual contract interaction
      const transactionParameters = {
        to: CONTRACT_CONFIG.EMI_MANAGER_CONTRACT_ADDRESS,
        from: userAddress,
        data: this.encodeEMIContractCreation(merchantAddress, schedule),
        gas: '0xC350', // 50000 in hex
        gasPrice: '0x09184e72a000',
      };

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      // In reality, you'd wait for transaction confirmation and get contract address
      return {
        success: true,
        contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock address
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process monthly EMI payment
   */
  static async processEMIPayment(
    userAddress: string,
    emiContractAddress: string,
    paymentAmount: number
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not available');
      }

      const provider = window.ethereum;
      
      // Encode PYUSD transfer to EMI contract
      const amountInWei = Math.floor(paymentAmount * 1000000).toString();
      
      const transactionParameters = {
        to: CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS,
        from: userAddress,
        data: this.encodePYUSDTransfer(emiContractAddress, amountInWei),
        gas: '0x5208',
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
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's active EMI contracts
   */
  static async getUserEMIContracts(userAddress: string): Promise<any[]> {
    try {
      // This would query your EMI Manager contract for user's active EMIs
      // For now, return mock data
      return [
        {
          contractAddress: '0x1234567890123456789012345678901234567890',
          merchantName: 'TechStore Pro',
          originalAmount: 349.97,
          remainingAmount: 233.31,
          monthlyPayment: 58.33,
          nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'active',
        },
      ];
    } catch (error) {
      console.error('Failed to get EMI contracts:', error);
      return [];
    }
  }

  private static encodeEMIContractCreation(merchantAddress: string, schedule: EMISchedule): string {
    // This would encode the function call to create EMI contract
    // Including merchant address, payment schedule, amounts, etc.
    // For now, return a mock encoding
    return '0x' + merchantAddress.replace('0x', '') + 
           schedule.totalAmount.toString(16).padStart(64, '0');
  }

  private static encodePYUSDTransfer(to: string, amount: string): string {
    const functionSignature = '0xa9059cbb';
    const paddedTo = to.replace('0x', '').padStart(64, '0');
    const paddedAmount = parseInt(amount).toString(16).padStart(64, '0');
    return functionSignature + paddedTo + paddedAmount;
  }
}