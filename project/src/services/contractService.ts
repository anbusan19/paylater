import { ethers } from 'ethers';
import {
    EMI_MANAGER_ABI,
    EMI_CONTRACT_ABI,
    USER_PROFILE_ABI,
    LIQUIDITY_POOL_ABI,
    PYUSD_ABI
} from '../contracts/contractInterfaces';

// Declare global ethereum interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract addresses - these should be set after deployment
const CONTRACT_ADDRESSES = {
    PYUSD: import.meta.env.VITE_PYUSD_ADDRESS || '0x6f14C02fC1F78322cFd7d707aB90f18baD3B54f5',
    EMI_MANAGER: import.meta.env.VITE_EMI_MANAGER_ADDRESS || '',
    USER_PROFILE: import.meta.env.VITE_USER_PROFILE_ADDRESS || '',
    LIQUIDITY_POOL: import.meta.env.VITE_LIQUIDITY_POOL_ADDRESS || ''
};

// Development mode flag
const MOCK_MODE = !CONTRACT_ADDRESSES.EMI_MANAGER || CONTRACT_ADDRESSES.EMI_MANAGER === '';

export interface EMIEligibility {
    isEligible: boolean;
    creditScore: number;
    maxAmount: string;
    reason: string;
}

export interface EMIPlanRequest {
    user: string;
    merchant: string;
    totalAmount: string;
    termMonths: number;
    interestRate: number;
    depositAmount: string;
    depositPercentage: number;
}

export interface EMIDetails {
    userAddress: string;
    merchantAddress: string;
    totalAmount: string;
    monthlyAmount: string;
    remainingPayments: number;
    nextPaymentDate: number;
    status: string;
    depositAmount: string;
    depositPaid: boolean;
}

export interface InstallmentData {
    installmentNumber: number;
    dueDate: number;
    amount: string;
    status: number; // 0: Pending, 1: Paid, 2: Overdue, 3: Waived
    paidDate: number;
    transactionHash: string;
}

export interface UserProfileData {
    totalEMIs: number;
    activeEMIs: number;
    completedEMIs: number;
    creditScore: number;
    totalAmountFinanced: string;
    onTimePaymentRate: number;
}

class ContractService {
    private provider: ethers.providers.Web3Provider | null = null;
    private signer: ethers.Signer | null = null;

    async initialize() {
        try {
            if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
                
                // Request account access if needed
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                console.log('Contract service initialized successfully');
            } else {
                throw new Error('MetaMask not found. Please install MetaMask to use this feature.');
            }
        } catch (error) {
            console.error('Failed to initialize contract service:', error);
            throw error;
        }
    }

    isInitialized(): boolean {
        return this.provider !== null && this.signer !== null;
    }

    private getContract(address: string, abi: any[]) {
        if (!this.signer) {
            throw new Error('Contract service not initialized. Please connect your wallet first.');
        }
        if (!address || address === '') {
            throw new Error('Contract address not configured. Please check your environment variables.');
        }
        return new ethers.Contract(address, abi, this.signer);
    }

    // EMI Manager functions
    async verifyEligibility(userAddress: string): Promise<EMIEligibility> {
        if (MOCK_MODE) {
            // Mock response for development
            return {
                isEligible: true,
                creditScore: 750,
                maxAmount: "10000.00",
                reason: "Eligible for EMI (Mock Mode)"
            };
        }

        try {
            const contract = this.getContract(CONTRACT_ADDRESSES.EMI_MANAGER, EMI_MANAGER_ABI);
            const result = await contract.verifyEligibility(userAddress);

            return {
                isEligible: result.isEligible,
                creditScore: result.creditScore.toNumber(),
                maxAmount: ethers.utils.formatUnits(result.maxAmount, 6), // PYUSD has 6 decimals
                reason: result.reason
            };
        } catch (error) {
            console.error('Error verifying eligibility:', error);
            throw new Error('Failed to verify EMI eligibility. Please try again.');
        }
    }

    async createEMIPlan(request: EMIPlanRequest): Promise<string> {
        if (MOCK_MODE) {
            // Mock response for development
            console.log('Creating EMI plan in mock mode:', request);
            return '0x' + Math.random().toString(16).substr(2, 40); // Mock contract address
        }

        try {
            const contract = this.getContract(CONTRACT_ADDRESSES.EMI_MANAGER, EMI_MANAGER_ABI);

            const formattedRequest = {
                user: request.user,
                merchant: request.merchant,
                totalAmount: ethers.utils.parseUnits(request.totalAmount, 6),
                termMonths: request.termMonths,
                interestRate: request.interestRate,
                depositAmount: ethers.utils.parseUnits(request.depositAmount, 6),
                depositPercentage: request.depositPercentage
            };

            const tx = await contract.createEMIPlan(formattedRequest);
            const receipt = await tx.wait();

            // Extract EMI contract address from event
            const event = receipt.events?.find((e: any) => e.event === 'EMIContractCreated');
            return event?.args?.emiContract || '';
        } catch (error) {
            console.error('Error creating EMI plan:', error);
            throw new Error('Failed to create EMI plan. Please check your wallet balance and try again.');
        }
    }

    async getUserEMIContracts(userAddress: string): Promise<string[]> {
        if (MOCK_MODE) {
            // Mock response for development
            return ['0x1234567890123456789012345678901234567890', '0x0987654321098765432109876543210987654321'];
        }

        try {
            const contract = this.getContract(CONTRACT_ADDRESSES.EMI_MANAGER, EMI_MANAGER_ABI);
            return await contract.getUserEMIContracts(userAddress);
        } catch (error) {
            console.error('Error getting user EMI contracts:', error);
            return [];
        }
    }

    async calculateInterestRate(creditScore: number, termMonths: number): Promise<number> {
        if (MOCK_MODE) {
            // Mock calculation for development
            let baseRate = 1200; // 12%
            if (creditScore >= 750) baseRate = 1000; // 10%
            else if (creditScore >= 700) baseRate = 1100; // 11%
            if (termMonths > 12) baseRate += 100; // +1% for long term
            return baseRate;
        }

        try {
            const contract = this.getContract(CONTRACT_ADDRESSES.EMI_MANAGER, EMI_MANAGER_ABI);
            const rate = await contract.calculateInterestRate(creditScore, termMonths);
            return rate.toNumber();
        } catch (error) {
            console.error('Error calculating interest rate:', error);
            return 1200; // Default 12%
        }
    }

    // EMI Contract functions
    async getEMIDetails(emiContractAddress: string): Promise<EMIDetails> {
        const contract = this.getContract(emiContractAddress, EMI_CONTRACT_ABI);
        const result = await contract.getEMIDetails();

        return {
            userAddress: result.userAddress,
            merchantAddress: result.merchantAddress,
            totalAmount: ethers.utils.formatUnits(result.totalAmt, 6),
            monthlyAmount: ethers.utils.formatUnits(result.monthlyAmt, 6),
            remainingPayments: result.remainingPayments.toNumber(),
            nextPaymentDate: result.nextPayment.toNumber(),
            status: this.getStatusString(result.emiStatus),
            depositAmount: ethers.utils.formatUnits(result.depositAmt, 6),
            depositPaid: result.depositStatus
        };
    }

    async processDeposit(emiContractAddress: string): Promise<string> {
        // First approve PYUSD spending
        const pyusdContract = this.getContract(CONTRACT_ADDRESSES.PYUSD, PYUSD_ABI);
        const emiContract = this.getContract(emiContractAddress, EMI_CONTRACT_ABI);

        const emiDetails = await this.getEMIDetails(emiContractAddress);
        const depositAmount = ethers.utils.parseUnits(emiDetails.depositAmount, 6);

        // Approve PYUSD transfer
        const approveTx = await pyusdContract.approve(emiContractAddress, depositAmount);
        await approveTx.wait();

        // Process deposit
        const tx = await emiContract.processDeposit();
        const receipt = await tx.wait();

        return receipt.transactionHash;
    }

    async processInstallmentPayment(emiContractAddress: string, installmentNumber: number): Promise<string> {
        const pyusdContract = this.getContract(CONTRACT_ADDRESSES.PYUSD, PYUSD_ABI);
        const emiContract = this.getContract(emiContractAddress, EMI_CONTRACT_ABI);

        const emiDetails = await this.getEMIDetails(emiContractAddress);
        const paymentAmount = ethers.utils.parseUnits(emiDetails.monthlyAmount, 6);

        // Approve PYUSD transfer
        const approveTx = await pyusdContract.approve(emiContractAddress, paymentAmount);
        await approveTx.wait();

        // Process payment
        const tx = await emiContract.processInstallmentPayment(installmentNumber);
        const receipt = await tx.wait();

        return receipt.transactionHash;
    }

    async makeEarlyPayment(emiContractAddress: string, amount: string): Promise<string> {
        const pyusdContract = this.getContract(CONTRACT_ADDRESSES.PYUSD, PYUSD_ABI);
        const emiContract = this.getContract(emiContractAddress, EMI_CONTRACT_ABI);

        const paymentAmount = ethers.utils.parseUnits(amount, 6);

        // Approve PYUSD transfer
        const approveTx = await pyusdContract.approve(emiContractAddress, paymentAmount);
        await approveTx.wait();

        // Make early payment
        const tx = await emiContract.makeEarlyPayment(paymentAmount);
        const receipt = await tx.wait();

        return receipt.transactionHash;
    }

    async getInstallmentSchedule(emiContractAddress: string): Promise<InstallmentData[]> {
        const contract = this.getContract(emiContractAddress, EMI_CONTRACT_ABI);
        const schedule = await contract.getInstallmentSchedule();

        return schedule.map((installment: any) => ({
            installmentNumber: installment.installmentNumber.toNumber(),
            dueDate: installment.dueDate.toNumber(),
            amount: ethers.utils.formatUnits(installment.amount, 6),
            status: installment.status,
            paidDate: installment.paidDate.toNumber(),
            transactionHash: installment.transactionHash
        }));
    }

    // User Profile functions
    async getUserProfile(userAddress: string): Promise<UserProfileData> {
        if (MOCK_MODE) {
            // Mock response for development
            return {
                totalEMIs: 8,
                activeEMIs: 2,
                completedEMIs: 6,
                creditScore: 750,
                totalAmountFinanced: "15420.50",
                onTimePaymentRate: 9650 // 96.5%
            };
        }

        try {
            const contract = this.getContract(CONTRACT_ADDRESSES.USER_PROFILE, USER_PROFILE_ABI);
            const result = await contract.getUserProfile(userAddress);

            return {
                totalEMIs: result.totalEMIs.toNumber(),
                activeEMIs: result.activeEMIs.toNumber(),
                completedEMIs: result.completedEMIs.toNumber(),
                creditScore: result.creditScore.toNumber(),
                totalAmountFinanced: ethers.utils.formatUnits(result.totalAmountFinanced, 6),
                onTimePaymentRate: result.onTimePaymentRate.toNumber()
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw new Error('Failed to get user profile. Please try again.');
        }
    }

    // PYUSD functions
    async getPYUSDBalance(userAddress: string): Promise<string> {
        const contract = this.getContract(CONTRACT_ADDRESSES.PYUSD, PYUSD_ABI);
        const balance = await contract.balanceOf(userAddress);
        return ethers.utils.formatUnits(balance, 6);
    }

    async approvePYUSD(spender: string, amount: string): Promise<string> {
        const contract = this.getContract(CONTRACT_ADDRESSES.PYUSD, PYUSD_ABI);
        const tx = await contract.approve(spender, ethers.utils.parseUnits(amount, 6));
        const receipt = await tx.wait();
        return receipt.transactionHash;
    }

    // Liquidity Pool functions
    async getPoolBalance(): Promise<string> {
        const contract = this.getContract(CONTRACT_ADDRESSES.LIQUIDITY_POOL, LIQUIDITY_POOL_ABI);
        const balance = await contract.getPoolBalance();
        return ethers.utils.formatUnits(balance, 6);
    }

    async addLiquidity(amount: string): Promise<string> {
        const pyusdContract = this.getContract(CONTRACT_ADDRESSES.PYUSD, PYUSD_ABI);
        const poolContract = this.getContract(CONTRACT_ADDRESSES.LIQUIDITY_POOL, LIQUIDITY_POOL_ABI);

        const liquidityAmount = ethers.utils.parseUnits(amount, 6);

        // Approve PYUSD transfer
        const approveTx = await pyusdContract.approve(CONTRACT_ADDRESSES.LIQUIDITY_POOL, liquidityAmount);
        await approveTx.wait();

        // Add liquidity
        const tx = await poolContract.addLiquidity(liquidityAmount);
        const receipt = await tx.wait();

        return receipt.transactionHash;
    }

    // Utility functions
    private getStatusString(status: number): string {
        const statuses = ['Created', 'Active', 'Completed', 'Defaulted', 'Cancelled'];
        return statuses[status] || 'Unknown';
    }

    async waitForTransaction(txHash: string): Promise<ethers.providers.TransactionReceipt> {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        return await this.provider.waitForTransaction(txHash);
    }

    async getCurrentBlock(): Promise<number> {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        return await this.provider.getBlockNumber();
    }

    async getGasPrice(): Promise<string> {
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        const gasPrice = await this.provider.getGasPrice();
        return ethers.utils.formatUnits(gasPrice, 'gwei');
    }
}

export const contractService = new ContractService();