// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserProfile is Ownable {
    struct Profile {
        uint256 totalEMIs;
        uint256 activeEMIs;
        uint256 completedEMIs;
        uint256 defaultedEMIs;
        uint256 creditScore;
        uint256 totalAmountFinanced;
        uint256 onTimePaymentRate; // Basis points (e.g., 9500 = 95%)
        uint256 joinDate;
        bool isVerified;
    }
    
    struct PaymentRecord {
        address emiContract;
        string merchantName;
        uint256 amount;
        uint256 timestamp;
        PaymentType paymentType;
        PaymentStatus status;
    }
    
    enum PaymentType { Deposit, Installment, EarlyPayment, LateFee }
    enum PaymentStatus { Completed, Failed, Pending }
    
    mapping(address => Profile) public userProfiles;
    mapping(address => address[]) public userEMIContracts;
    mapping(address => PaymentRecord[]) public userPaymentHistory;
    mapping(address => bool) public authorizedContracts;
    
    uint256 public constant INITIAL_CREDIT_SCORE = 650;
    uint256 public constant MAX_CREDIT_SCORE = 850;
    uint256 public constant MIN_CREDIT_SCORE = 300;
    
    event ProfileCreated(address indexed user, uint256 creditScore);
    event CreditScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    event PaymentRecorded(address indexed user, address emiContract, uint256 amount, PaymentType paymentType);
    event EMIAdded(address indexed user, address emiContract);
    event EMICompleted(address indexed user, address emiContract);
    event DefaultRecorded(address indexed user, address emiContract);
    
    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender], "Not authorized contract");
        _;
    }
    
    constructor() {}
    
    function authorizeContract(address contractAddress, bool authorized) external onlyOwner {
        authorizedContracts[contractAddress] = authorized;
    }
    
    function createProfile(address user) external onlyAuthorizedContract {
        require(userProfiles[user].joinDate == 0, "Profile already exists");
        
        userProfiles[user] = Profile({
            totalEMIs: 0,
            activeEMIs: 0,
            completedEMIs: 0,
            defaultedEMIs: 0,
            creditScore: INITIAL_CREDIT_SCORE,
            totalAmountFinanced: 0,
            onTimePaymentRate: 10000, // 100% initially
            joinDate: block.timestamp,
            isVerified: false
        });
        
        emit ProfileCreated(user, INITIAL_CREDIT_SCORE);
    }
    
    function getUserProfile(address user) external view returns (Profile memory) {
        return userProfiles[user];
    }
    
    function addEMI(address user, address emiContract) external onlyAuthorizedContract {
        Profile storage profile = userProfiles[user];
        
        // Create profile if it doesn't exist
        if (profile.joinDate == 0) {
            this.createProfile(user);
            profile = userProfiles[user];
        }
        
        profile.totalEMIs++;
        profile.activeEMIs++;
        
        userEMIContracts[user].push(emiContract);
        
        emit EMIAdded(user, emiContract);
    }
    
    function recordPayment(
        address user,
        address emiContract,
        uint256 amount,
        PaymentType paymentType
    ) external onlyAuthorizedContract {
        Profile storage profile = userProfiles[user];
        
        // Add to payment history
        userPaymentHistory[user].push(PaymentRecord({
            emiContract: emiContract,
            merchantName: "", // To be set by frontend
            amount: amount,
            timestamp: block.timestamp,
            paymentType: paymentType,
            status: PaymentStatus.Completed
        }));
        
        // Update total amount financed for deposits
        if (paymentType == PaymentType.Deposit) {
            // This will be updated when EMI is created with full amount
        }
        
        // Update credit score based on payment behavior
        _updateCreditScoreForPayment(user, paymentType, true);
        
        emit PaymentRecorded(user, emiContract, amount, paymentType);
    }
    
    function completeEMI(address user, address emiContract) external onlyAuthorizedContract {
        Profile storage profile = userProfiles[user];
        
        require(profile.activeEMIs > 0, "No active EMIs");
        
        profile.activeEMIs--;
        profile.completedEMIs++;
        
        // Boost credit score for successful completion
        _updateCreditScore(user, profile.creditScore + 10);
        
        emit EMICompleted(user, emiContract);
    }
    
    function recordDefault(address user, address emiContract) external onlyAuthorizedContract {
        Profile storage profile = userProfiles[user];
        
        require(profile.activeEMIs > 0, "No active EMIs");
        
        profile.activeEMIs--;
        profile.defaultedEMIs++;
        
        // Significantly reduce credit score for default
        uint256 newScore = profile.creditScore > 100 ? profile.creditScore - 100 : MIN_CREDIT_SCORE;
        _updateCreditScore(user, newScore);
        
        emit DefaultRecorded(user, emiContract);
    }
    
    function recordLatePayment(address user) external onlyAuthorizedContract {
        // Reduce credit score for late payment
        Profile storage profile = userProfiles[user];
        uint256 newScore = profile.creditScore > 5 ? profile.creditScore - 5 : MIN_CREDIT_SCORE;
        _updateCreditScore(user, newScore);
    }
    
    function _updateCreditScoreForPayment(address user, PaymentType paymentType, bool onTime) internal {
        Profile storage profile = userProfiles[user];
        
        if (paymentType == PaymentType.Installment) {
            if (onTime) {
                // Small boost for on-time payments
                if (profile.creditScore < MAX_CREDIT_SCORE) {
                    _updateCreditScore(user, profile.creditScore + 2);
                }
            } else {
                // Penalty for late payments
                uint256 newScore = profile.creditScore > 10 ? profile.creditScore - 10 : MIN_CREDIT_SCORE;
                _updateCreditScore(user, newScore);
            }
        } else if (paymentType == PaymentType.EarlyPayment) {
            // Boost for early payments
            if (profile.creditScore < MAX_CREDIT_SCORE) {
                _updateCreditScore(user, profile.creditScore + 5);
            }
        }
    }
    
    function _updateCreditScore(address user, uint256 newScore) internal {
        Profile storage profile = userProfiles[user];
        uint256 oldScore = profile.creditScore;
        
        // Ensure score stays within bounds
        if (newScore > MAX_CREDIT_SCORE) {
            newScore = MAX_CREDIT_SCORE;
        } else if (newScore < MIN_CREDIT_SCORE) {
            newScore = MIN_CREDIT_SCORE;
        }
        
        profile.creditScore = newScore;
        
        emit CreditScoreUpdated(user, oldScore, newScore);
    }
    
    function calculateOnTimePaymentRate(address user) external view returns (uint256) {
        PaymentRecord[] memory payments = userPaymentHistory[user];
        if (payments.length == 0) return 10000; // 100% if no payments yet
        
        uint256 onTimePayments = 0;
        uint256 totalInstallments = 0;
        
        for (uint256 i = 0; i < payments.length; i++) {
            if (payments[i].paymentType == PaymentType.Installment) {
                totalInstallments++;
                if (payments[i].status == PaymentStatus.Completed) {
                    onTimePayments++;
                }
            }
        }
        
        if (totalInstallments == 0) return 10000;
        
        return (onTimePayments * 10000) / totalInstallments;
    }
    
    function getActiveEMIs(address user) external view returns (address[] memory) {
        return userEMIContracts[user];
    }
    
    function getPaymentHistory(address user) external view returns (PaymentRecord[] memory) {
        return userPaymentHistory[user];
    }
    
    function updateTotalAmountFinanced(address user, uint256 amount) external onlyAuthorizedContract {
        userProfiles[user].totalAmountFinanced += amount;
    }
    
    function verifyUser(address user) external onlyOwner {
        userProfiles[user].isVerified = true;
    }
    
    function updateCreditScore(address user, uint256 newScore) external onlyOwner {
        _updateCreditScore(user, newScore);
    }
    
    // View functions for analytics
    function getTotalUsers() external view returns (uint256) {
        // This would need to be implemented with a counter in a real contract
        return 0; // Placeholder
    }
    
    function getAverageCreditScore() external view returns (uint256) {
        // This would need to be implemented with proper tracking
        return 0; // Placeholder
    }
}