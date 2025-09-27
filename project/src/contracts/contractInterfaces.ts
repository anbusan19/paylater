// Smart Contract Interfaces for PayLater
// These interfaces should match your deployed contracts in pyusd-contract directory

export interface PaymentContract {
    // Direct payment from user to merchant
    processInstantPayment(
        userAddress: string,
        merchantAddress: string,
        amount: string
    ): Promise<string>; // Returns transaction hash
}

export interface EMIManagerContract {
    // Verify user eligibility for EMI
    verifyEligibility(userAddress: string): Promise<{
        isEligible: boolean;
        creditScore: number;
        maxAmount: string;
        reason: string;
    }>;

    // Create new EMI plan with deposit
    createEMIPlan(request: {
        user: string;
        merchant: string;
        totalAmount: string;
        termMonths: number;
        interestRate: number;
        depositAmount: string;
        depositPercentage: number;
    }): Promise<string>; // Returns EMI contract address

    // Get user's active EMI plans
    getUserEMIContracts(userAddress: string): Promise<string[]>; // Returns array of EMI contract addresses

    // Calculate interest rate based on credit score and term
    calculateInterestRate(creditScore: number, termMonths: number): Promise<number>;

    // Get active EMI count for user
    getActiveEMICount(userAddress: string): Promise<number>;
}

export interface LiquidityPoolContract {
    // Transfer from liquidity pool to merchant for EMI
    transferToMerchant(
        merchantAddress: string,
        amount: string,
        emiContractAddress: string
    ): Promise<string>; // Returns transaction hash

    // Get pool balance
    getPoolBalance(): Promise<string>;

    // Add liquidity to pool
    addLiquidity(amount: string): Promise<string>;
}

export interface EMIContract {
    // Get EMI details
    getEMIDetails(): Promise<{
        userAddress: string;
        merchantAddress: string;
        totalAmount: string;
        monthlyAmount: string;
        remainingPayments: number;
        nextPaymentDate: number;
        status: string;
        depositAmount: string;
        depositPaid: boolean;
    }>;

    // Process deposit payment
    processDeposit(amount: string): Promise<string>;

    // Process monthly payment
    processPayment(amount: string): Promise<string>;

    // Get payment history
    getPaymentHistory(): Promise<Array<{
        amount: string;
        timestamp: number;
        transactionHash: string;
        paymentType: 'deposit' | 'installment';
    }>>;

    // Get installment schedule
    getInstallmentSchedule(): Promise<Array<{
        installmentNumber: number;
        dueDate: number;
        amount: string;
        status: 'pending' | 'paid' | 'overdue';
        paidDate?: number;
        transactionHash?: string;
    }>>;
}

export interface UserProfileContract {
    // Get user's EMI history and profile
    getUserProfile(userAddress: string): Promise<{
        totalEMIs: number;
        activeEMIs: number;
        completedEMIs: number;
        creditScore: number;
        totalAmountFinanced: string;
        onTimePaymentRate: number;
    }>;

    // Get user's active EMI contracts
    getActiveEMIs(userAddress: string): Promise<string[]>;

    // Get user's payment history across all EMIs
    getPaymentHistory(userAddress: string): Promise<Array<{
        emiContractAddress: string;
        merchantName: string;
        amount: string;
        timestamp: number;
        paymentType: 'deposit' | 'installment';
        status: string;
    }>>;

    // Update user's credit score
    updateCreditScore(userAddress: string, newScore: number): Promise<string>;
}

// Contract ABIs - These should be imported from your compiled contracts
export const PAYMENT_CONTRACT_ABI = [
    // Add your Payment Contract ABI here
    {
        "inputs": [
            { "name": "merchant", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "processInstantPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const EMI_MANAGER_ABI = [
    // Add your EMI Manager Contract ABI here
    {
        "inputs": [{ "name": "user", "type": "address" }],
        "name": "verifyEligibility",
        "outputs": [
            { "name": "isEligible", "type": "bool" },
            { "name": "creditScore", "type": "uint256" },
            { "name": "maxAmount", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export const LIQUIDITY_POOL_ABI = [
    // Add your Liquidity Pool Contract ABI here
    {
        "inputs": [
            { "name": "merchant", "type": "address" },
            { "name": "amount", "type": "uint256" },
            { "name": "emiContract", "type": "address" }
        ],
        "name": "transferToMerchant",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const EMI_CONTRACT_ABI = [
    // Enhanced EMI Contract ABI with deposit functionality
    {
        "inputs": [],
        "name": "getEMIDetails",
        "outputs": [
            { "name": "userAddress", "type": "address" },
            { "name": "merchantAddress", "type": "address" },
            { "name": "totalAmount", "type": "uint256" },
            { "name": "monthlyAmount", "type": "uint256" },
            { "name": "remainingPayments", "type": "uint256" },
            { "name": "nextPaymentDate", "type": "uint256" },
            { "name": "status", "type": "string" },
            { "name": "depositAmount", "type": "uint256" },
            { "name": "depositPaid", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "amount", "type": "uint256" }],
        "name": "processDeposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getInstallmentSchedule",
        "outputs": [
            {
                "components": [
                    { "name": "installmentNumber", "type": "uint256" },
                    { "name": "dueDate", "type": "uint256" },
                    { "name": "amount", "type": "uint256" },
                    { "name": "status", "type": "uint8" },
                    { "name": "paidDate", "type": "uint256" },
                    { "name": "transactionHash", "type": "bytes32" }
                ],
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export const USER_PROFILE_ABI = [
    // User Profile Contract ABI
    {
        "inputs": [{ "name": "userAddress", "type": "address" }],
        "name": "getUserProfile",
        "outputs": [
            { "name": "totalEMIs", "type": "uint256" },
            { "name": "activeEMIs", "type": "uint256" },
            { "name": "completedEMIs", "type": "uint256" },
            { "name": "creditScore", "type": "uint256" },
            { "name": "totalAmountFinanced", "type": "uint256" },
            { "name": "onTimePaymentRate", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "userAddress", "type": "address" }],
        "name": "getActiveEMIs",
        "outputs": [{ "name": "", "type": "address[]" }],
        "stateMutability": "view",
        "type": "function"
    }
];

export const PYUSD_ABI = [
    // Standard ERC-20 ABI for PYUSD
    {
        "inputs": [
            { "name": "to", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];