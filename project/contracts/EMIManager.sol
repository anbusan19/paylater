// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./EMIContract.sol";
import "./UserProfile.sol";
import "./LiquidityPool.sol";

contract EMIManager is ReentrancyGuard, Ownable {
    IERC20 public pyusdToken;
    UserProfile public userProfile;
    LiquidityPool public liquidityPool;
    
    struct EMIEligibility {
        bool isEligible;
        uint256 creditScore;
        uint256 maxAmount;
        string reason;
    }
    
    struct EMIPlanRequest {
        address user;
        address merchant;
        uint256 totalAmount;
        uint256 termMonths;
        uint256 interestRate; // Basis points (e.g., 1200 = 12%)
        uint256 depositAmount;
        uint256 depositPercentage; // Basis points
    }
    
    mapping(address => address[]) public userEMIContracts;
    mapping(address => bool) public authorizedMerchants;
    
    uint256 public constant MIN_CREDIT_SCORE = 600;
    uint256 public constant MAX_CREDIT_SCORE = 850;
    uint256 public constant MIN_DEPOSIT_PERCENTAGE = 500; // 5%
    uint256 public constant MAX_DEPOSIT_PERCENTAGE = 5000; // 50%
    uint256 public constant BASE_INTEREST_RATE = 1200; // 12%
    
    event EMIContractCreated(
        address indexed user,
        address indexed merchant,
        address emiContract,
        uint256 totalAmount,
        uint256 termMonths,
        uint256 depositAmount
    );
    
    event MerchantAuthorized(address indexed merchant, bool authorized);
    
    constructor(
        address _pyusdToken,
        address _userProfile,
        address _liquidityPool
    ) {
        pyusdToken = IERC20(_pyusdToken);
        userProfile = UserProfile(_userProfile);
        liquidityPool = LiquidityPool(_liquidityPool);
    }
    
    modifier onlyAuthorizedMerchant() {
        require(authorizedMerchants[msg.sender], "Not authorized merchant");
        _;
    }
    
    function authorizeMerchant(address merchant, bool authorized) external onlyOwner {
        authorizedMerchants[merchant] = authorized;
        emit MerchantAuthorized(merchant, authorized);
    }
    
    function verifyEligibility(address user) external view returns (EMIEligibility memory) {
        UserProfile.Profile memory profile = userProfile.getUserProfile(user);
        
        // Check minimum credit score
        if (profile.creditScore < MIN_CREDIT_SCORE) {
            return EMIEligibility({
                isEligible: false,
                creditScore: profile.creditScore,
                maxAmount: 0,
                reason: "Credit score too low"
            });
        }
        
        // Check if user has too many active EMIs
        if (profile.activeEMIs > 5) {
            return EMIEligibility({
                isEligible: false,
                creditScore: profile.creditScore,
                maxAmount: 0,
                reason: "Too many active EMIs"
            });
        }
        
        // Calculate max amount based on credit score and payment history
        uint256 maxAmount = calculateMaxAmount(profile.creditScore, profile.onTimePaymentRate);
        
        return EMIEligibility({
            isEligible: true,
            creditScore: profile.creditScore,
            maxAmount: maxAmount,
            reason: "Eligible for EMI"
        });
    }
    
    function calculateMaxAmount(uint256 creditScore, uint256 onTimeRate) internal pure returns (uint256) {
        // Base amount increases with credit score
        uint256 baseAmount = ((creditScore - MIN_CREDIT_SCORE) * 10000) / (MAX_CREDIT_SCORE - MIN_CREDIT_SCORE);
        
        // Adjust based on payment history
        uint256 historyMultiplier = onTimeRate > 9500 ? 120 : (onTimeRate > 9000 ? 110 : 100);
        
        return (baseAmount * historyMultiplier) / 100;
    }
    
    function createEMIPlan(
        EMIPlanRequest memory request
    ) external onlyAuthorizedMerchant nonReentrant returns (address) {
        // Verify user eligibility
        EMIEligibility memory eligibility = this.verifyEligibility(request.user);
        require(eligibility.isEligible, eligibility.reason);
        require(request.totalAmount <= eligibility.maxAmount, "Amount exceeds limit");
        
        // Validate deposit
        require(
            request.depositPercentage >= MIN_DEPOSIT_PERCENTAGE &&
            request.depositPercentage <= MAX_DEPOSIT_PERCENTAGE,
            "Invalid deposit percentage"
        );
        
        uint256 expectedDeposit = (request.totalAmount * request.depositPercentage) / 10000;
        require(request.depositAmount == expectedDeposit, "Deposit amount mismatch");
        
        // Create EMI contract
        EMIContract emiContract = new EMIContract(
            request.user,
            request.merchant,
            address(pyusdToken),
            address(userProfile),
            address(liquidityPool),
            request.totalAmount,
            request.termMonths,
            request.interestRate,
            request.depositAmount
        );
        
        address emiAddress = address(emiContract);
        
        // Update user's EMI list
        userEMIContracts[request.user].push(emiAddress);
        
        // Update user profile
        userProfile.addEMI(request.user, emiAddress);
        
        emit EMIContractCreated(
            request.user,
            request.merchant,
            emiAddress,
            request.totalAmount,
            request.termMonths,
            request.depositAmount
        );
        
        return emiAddress;
    }
    
    function getUserEMIContracts(address user) external view returns (address[] memory) {
        return userEMIContracts[user];
    }
    
    function getActiveEMICount(address user) external view returns (uint256) {
        address[] memory contracts = userEMIContracts[user];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < contracts.length; i++) {
            EMIContract emi = EMIContract(contracts[i]);
            if (emi.getStatus() == EMIContract.EMIStatus.Active) {
                activeCount++;
            }
        }
        
        return activeCount;
    }
    
    function calculateInterestRate(uint256 creditScore, uint256 termMonths) external pure returns (uint256) {
        uint256 baseRate = BASE_INTEREST_RATE;
        
        // Adjust based on credit score (better score = lower rate)
        if (creditScore >= 750) {
            baseRate = baseRate * 90 / 100; // 10% discount
        } else if (creditScore >= 700) {
            baseRate = baseRate * 95 / 100; // 5% discount
        } else if (creditScore < 650) {
            baseRate = baseRate * 110 / 100; // 10% premium
        }
        
        // Adjust based on term (longer term = higher rate)
        if (termMonths > 12) {
            baseRate = baseRate * 105 / 100; // 5% premium for long term
        } else if (termMonths <= 6) {
            baseRate = baseRate * 95 / 100; // 5% discount for short term
        }
        
        return baseRate;
    }
    
    // Emergency functions
    function pauseEMI(address emiContract) external onlyOwner {
        EMIContract(emiContract).pause();
    }
    
    function unpauseEMI(address emiContract) external onlyOwner {
        EMIContract(emiContract).unpause();
    }
}