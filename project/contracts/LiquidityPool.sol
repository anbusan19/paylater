// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LiquidityPool is ReentrancyGuard, Ownable {
    IERC20 public pyusdToken;
    
    struct PoolStats {
        uint256 totalLiquidity;
        uint256 availableLiquidity;
        uint256 lockedLiquidity;
        uint256 totalEMIsFinanced;
        uint256 totalInterestEarned;
    }
    
    struct LiquidityProvider {
        uint256 amount;
        uint256 timestamp;
        uint256 interestEarned;
        bool isActive;
    }
    
    mapping(address => LiquidityProvider) public liquidityProviders;
    mapping(address => bool) public authorizedEMIContracts;
    
    PoolStats public poolStats;
    
    uint256 public constant INTEREST_RATE = 800; // 8% APY for liquidity providers
    uint256 public constant MIN_LIQUIDITY = 1000 * 10**6; // 1000 PYUSD minimum
    
    event LiquidityAdded(address indexed provider, uint256 amount);
    event LiquidityRemoved(address indexed provider, uint256 amount);
    event TransferToMerchant(address indexed merchant, uint256 amount, address indexed emiContract);
    event InterestDistributed(address indexed provider, uint256 amount);
    event EMIContractAuthorized(address indexed emiContract, bool authorized);
    
    modifier onlyAuthorizedEMI() {
        require(authorizedEMIContracts[msg.sender], "Not authorized EMI contract");
        _;
    }
    
    constructor(address _pyusdToken) {
        pyusdToken = IERC20(_pyusdToken);
    }
    
    function authorizeEMIContract(address emiContract, bool authorized) external onlyOwner {
        authorizedEMIContracts[emiContract] = authorized;
        emit EMIContractAuthorized(emiContract, authorized);
    }
    
    function addLiquidity(uint256 amount) external nonReentrant {
        require(amount >= MIN_LIQUIDITY, "Amount below minimum");
        
        // Transfer PYUSD from provider to pool
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        LiquidityProvider storage provider = liquidityProviders[msg.sender];
        
        // Calculate and distribute any pending interest
        if (provider.isActive) {
            uint256 pendingInterest = calculatePendingInterest(msg.sender);
            if (pendingInterest > 0) {
                provider.interestEarned += pendingInterest;
            }
        }
        
        provider.amount += amount;
        provider.timestamp = block.timestamp;
        provider.isActive = true;
        
        // Update pool stats
        poolStats.totalLiquidity += amount;
        poolStats.availableLiquidity += amount;
        
        emit LiquidityAdded(msg.sender, amount);
    }
    
    function removeLiquidity(uint256 amount) external nonReentrant {
        LiquidityProvider storage provider = liquidityProviders[msg.sender];
        require(provider.isActive, "No active liquidity");
        require(provider.amount >= amount, "Insufficient liquidity");
        require(poolStats.availableLiquidity >= amount, "Insufficient pool liquidity");
        
        // Calculate and add pending interest
        uint256 pendingInterest = calculatePendingInterest(msg.sender);
        provider.interestEarned += pendingInterest;
        
        // Update provider
        provider.amount -= amount;
        provider.timestamp = block.timestamp;
        
        if (provider.amount == 0) {
            provider.isActive = false;
        }
        
        // Update pool stats
        poolStats.totalLiquidity -= amount;
        poolStats.availableLiquidity -= amount;
        
        // Transfer PYUSD back to provider (including interest)
        uint256 totalWithdrawal = amount + provider.interestEarned;
        provider.interestEarned = 0;
        
        require(
            pyusdToken.transfer(msg.sender, totalWithdrawal),
            "Transfer failed"
        );
        
        emit LiquidityRemoved(msg.sender, amount);
        
        if (pendingInterest > 0) {
            emit InterestDistributed(msg.sender, pendingInterest);
        }
    }
    
    function transferToMerchant(
        address merchant,
        uint256 amount,
        address emiContract
    ) external onlyAuthorizedEMI nonReentrant {
        require(poolStats.availableLiquidity >= amount, "Insufficient liquidity");
        
        // Update pool stats
        poolStats.availableLiquidity -= amount;
        poolStats.lockedLiquidity += amount;
        poolStats.totalEMIsFinanced++;
        
        // Transfer to merchant
        require(pyusdToken.transfer(merchant, amount), "Transfer to merchant failed");
        
        emit TransferToMerchant(merchant, amount, emiContract);
    }
    
    function receiveEMIPayment(uint256 amount) external onlyAuthorizedEMI nonReentrant {
        // This function is called when EMI payments are received
        // The payment goes back to the pool to maintain liquidity
        
        // Update pool stats
        poolStats.lockedLiquidity -= amount;
        poolStats.availableLiquidity += amount;
        
        // Calculate interest earned (difference between what was lent and what's received)
        // This is simplified - in practice, you'd track individual EMI contracts
        uint256 interestEarned = amount / 100; // Simplified calculation
        poolStats.totalInterestEarned += interestEarned;
    }
    
    function calculatePendingInterest(address provider) public view returns (uint256) {
        LiquidityProvider memory providerData = liquidityProviders[provider];
        if (!providerData.isActive || providerData.amount == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - providerData.timestamp;
        uint256 annualInterest = (providerData.amount * INTEREST_RATE) / 10000;
        uint256 pendingInterest = (annualInterest * timeElapsed) / (365 days);
        
        return pendingInterest;
    }
    
    function claimInterest() external nonReentrant {
        LiquidityProvider storage provider = liquidityProviders[msg.sender];
        require(provider.isActive, "No active liquidity");
        
        uint256 pendingInterest = calculatePendingInterest(msg.sender);
        uint256 totalInterest = provider.interestEarned + pendingInterest;
        
        require(totalInterest > 0, "No interest to claim");
        require(poolStats.availableLiquidity >= totalInterest, "Insufficient pool funds");
        
        // Reset interest tracking
        provider.interestEarned = 0;
        provider.timestamp = block.timestamp;
        
        // Update pool stats
        poolStats.availableLiquidity -= totalInterest;
        
        // Transfer interest to provider
        require(pyusdToken.transfer(msg.sender, totalInterest), "Interest transfer failed");
        
        emit InterestDistributed(msg.sender, totalInterest);
    }
    
    function getPoolBalance() external view returns (uint256) {
        return pyusdToken.balanceOf(address(this));
    }
    
    function getPoolStats() external view returns (PoolStats memory) {
        return poolStats;
    }
    
    function getLiquidityProvider(address provider) external view returns (LiquidityProvider memory) {
        return liquidityProviders[provider];
    }
    
    function getAvailableLiquidity() external view returns (uint256) {
        return poolStats.availableLiquidity;
    }
    
    function calculateAPY() external view returns (uint256) {
        if (poolStats.totalLiquidity == 0) return 0;
        
        // Calculate APY based on utilization rate
        uint256 utilizationRate = (poolStats.lockedLiquidity * 10000) / poolStats.totalLiquidity;
        
        // Higher utilization = higher APY for providers
        uint256 baseAPY = INTEREST_RATE;
        uint256 utilizationBonus = (utilizationRate * 200) / 10000; // Up to 2% bonus
        
        return baseAPY + utilizationBonus;
    }
    
    // Emergency functions
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= poolStats.availableLiquidity, "Insufficient available liquidity");
        require(pyusdToken.transfer(owner(), amount), "Emergency withdrawal failed");
    }
    
    function pause() external onlyOwner {
        // Implementation for pausing the contract
    }
    
    function unpause() external onlyOwner {
        // Implementation for unpausing the contract
    }
}