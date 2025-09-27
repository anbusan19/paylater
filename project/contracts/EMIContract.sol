// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./UserProfile.sol";
import "./LiquidityPool.sol";

contract EMIContract is ReentrancyGuard, Pausable {
    IERC20 public pyusdToken;
    UserProfile public userProfile;
    LiquidityPool public liquidityPool;
    
    address public user;
    address public merchant;
    address public emiManager;
    
    uint256 public totalAmount;
    uint256 public termMonths;
    uint256 public interestRate; // Basis points
    uint256 public depositAmount;
    uint256 public monthlyAmount;
    uint256 public remainingAmount;
    
    bool public depositPaid;
    uint256 public nextPaymentDate;
    uint256 public paymentsCompleted;
    
    enum EMIStatus { Created, Active, Completed, Defaulted, Cancelled }
    EMIStatus public status;
    
    struct Installment {
        uint256 installmentNumber;
        uint256 dueDate;
        uint256 amount;
        InstallmentStatus status;
        uint256 paidDate;
        bytes32 transactionHash;
    }
    
    enum InstallmentStatus { Pending, Paid, Overdue, Waived }
    
    struct PaymentRecord {
        uint256 amount;
        uint256 timestamp;
        bytes32 transactionHash;
        PaymentType paymentType;
    }
    
    enum PaymentType { Deposit, Installment, EarlyPayment, LateFee }
    
    Installment[] public installments;
    PaymentRecord[] public paymentHistory;
    
    uint256 public constant LATE_FEE_PERCENTAGE = 500; // 5%
    uint256 public constant GRACE_PERIOD = 3 days;
    
    event DepositPaid(address indexed user, uint256 amount, bytes32 transactionHash);
    event InstallmentPaid(address indexed user, uint256 installmentNumber, uint256 amount, bytes32 transactionHash);
    event EMICompleted(address indexed user, uint256 completionDate);
    event LateFeeApplied(address indexed user, uint256 installmentNumber, uint256 feeAmount);
    event EarlyPayment(address indexed user, uint256 amount, uint256 interestSaved);
    
    modifier onlyUser() {
        require(msg.sender == user, "Only user can call this function");
        _;
    }
    
    modifier onlyEMIManager() {
        require(msg.sender == emiManager, "Only EMI manager can call this function");
        _;
    }
    
    constructor(
        address _user,
        address _merchant,
        address _pyusdToken,
        address _userProfile,
        address _liquidityPool,
        uint256 _totalAmount,
        uint256 _termMonths,
        uint256 _interestRate,
        uint256 _depositAmount
    ) {
        user = _user;
        merchant = _merchant;
        pyusdToken = IERC20(_pyusdToken);
        userProfile = UserProfile(_userProfile);
        liquidityPool = LiquidityPool(_liquidityPool);
        emiManager = msg.sender;
        
        totalAmount = _totalAmount;
        termMonths = _termMonths;
        interestRate = _interestRate;
        depositAmount = _depositAmount;
        
        // Calculate monthly amount with interest
        uint256 principalAmount = totalAmount - depositAmount;
        uint256 totalInterest = (principalAmount * interestRate * termMonths) / (10000 * 12);
        uint256 totalWithInterest = principalAmount + totalInterest;
        monthlyAmount = totalWithInterest / termMonths;
        remainingAmount = totalWithInterest;
        
        status = EMIStatus.Created;
        
        // Generate installment schedule
        _generateInstallmentSchedule();
    }
    
    function _generateInstallmentSchedule() internal {
        uint256 startDate = block.timestamp;
        
        for (uint256 i = 1; i <= termMonths; i++) {
            uint256 dueDate = startDate + (i * 30 days); // Approximate monthly
            
            installments.push(Installment({
                installmentNumber: i,
                dueDate: dueDate,
                amount: monthlyAmount,
                status: InstallmentStatus.Pending,
                paidDate: 0,
                transactionHash: bytes32(0)
            }));
        }
        
        if (installments.length > 0) {
            nextPaymentDate = installments[0].dueDate;
        }
    }
    
    function processDeposit() external onlyUser nonReentrant whenNotPaused {
        require(!depositPaid, "Deposit already paid");
        require(status == EMIStatus.Created, "Invalid status for deposit");
        
        // Transfer deposit from user
        require(
            pyusdToken.transferFrom(user, address(this), depositAmount),
            "Deposit transfer failed"
        );
        
        // Transfer purchase amount to merchant from liquidity pool
        liquidityPool.transferToMerchant(merchant, totalAmount, address(this));
        
        depositPaid = true;
        status = EMIStatus.Active;
        
        bytes32 txHash = keccak256(abi.encodePacked(block.timestamp, user, depositAmount));
        
        // Record payment
        paymentHistory.push(PaymentRecord({
            amount: depositAmount,
            timestamp: block.timestamp,
            transactionHash: txHash,
            paymentType: PaymentType.Deposit
        }));
        
        // Update user profile
        userProfile.recordPayment(user, address(this), depositAmount, PaymentType.Deposit);
        
        emit DepositPaid(user, depositAmount, txHash);
    }
    
    function processInstallmentPayment(uint256 installmentNumber) external onlyUser nonReentrant whenNotPaused {
        require(depositPaid, "Deposit not paid");
        require(status == EMIStatus.Active, "EMI not active");
        require(installmentNumber > 0 && installmentNumber <= termMonths, "Invalid installment number");
        require(installmentNumber == paymentsCompleted + 1, "Pay installments in order");
        
        Installment storage installment = installments[installmentNumber - 1];
        require(installment.status == InstallmentStatus.Pending, "Installment already paid");
        
        uint256 paymentAmount = installment.amount;
        
        // Check for late fee
        if (block.timestamp > installment.dueDate + GRACE_PERIOD) {
            uint256 lateFee = (installment.amount * LATE_FEE_PERCENTAGE) / 10000;
            paymentAmount += lateFee;
            emit LateFeeApplied(user, installmentNumber, lateFee);
        }
        
        // Transfer payment from user
        require(
            pyusdToken.transferFrom(user, address(liquidityPool), paymentAmount),
            "Payment transfer failed"
        );
        
        // Update installment
        installment.status = InstallmentStatus.Paid;
        installment.paidDate = block.timestamp;
        installment.transactionHash = keccak256(abi.encodePacked(block.timestamp, user, paymentAmount));
        
        paymentsCompleted++;
        remainingAmount -= installment.amount;
        
        // Update next payment date
        if (paymentsCompleted < termMonths) {
            nextPaymentDate = installments[paymentsCompleted].dueDate;
        } else {
            nextPaymentDate = 0;
            status = EMIStatus.Completed;
            
            // Return deposit to user
            require(pyusdToken.transfer(user, depositAmount), "Deposit return failed");
            
            emit EMICompleted(user, block.timestamp);
        }
        
        // Record payment
        paymentHistory.push(PaymentRecord({
            amount: paymentAmount,
            timestamp: block.timestamp,
            transactionHash: installment.transactionHash,
            paymentType: PaymentType.Installment
        }));
        
        // Update user profile
        userProfile.recordPayment(user, address(this), paymentAmount, PaymentType.Installment);
        
        emit InstallmentPaid(user, installmentNumber, paymentAmount, installment.transactionHash);
    }
    
    function makeEarlyPayment(uint256 amount) external onlyUser nonReentrant whenNotPaused {
        require(depositPaid, "Deposit not paid");
        require(status == EMIStatus.Active, "EMI not active");
        require(amount > 0, "Invalid amount");
        require(amount <= remainingAmount, "Amount exceeds remaining balance");
        
        // Calculate interest savings for early payment
        uint256 remainingMonths = termMonths - paymentsCompleted;
        uint256 interestSaved = (amount * interestRate * remainingMonths) / (10000 * 12);
        
        // Transfer payment from user to liquidity pool
        require(
            pyusdToken.transferFrom(user, address(liquidityPool), amount),
            "Early payment transfer failed"
        );
        
        remainingAmount -= amount;
        
        // Update installments to reflect early payment
        _adjustInstallmentsForEarlyPayment(amount);
        
        bytes32 txHash = keccak256(abi.encodePacked(block.timestamp, user, amount));
        
        // Record payment
        paymentHistory.push(PaymentRecord({
            amount: amount,
            timestamp: block.timestamp,
            transactionHash: txHash,
            paymentType: PaymentType.EarlyPayment
        }));
        
        // Update user profile
        userProfile.recordPayment(user, address(this), amount, PaymentType.EarlyPayment);
        
        emit EarlyPayment(user, amount, interestSaved);
        
        // Check if EMI is fully paid
        if (remainingAmount == 0) {
            status = EMIStatus.Completed;
            
            // Return deposit to user
            require(pyusdToken.transfer(user, depositAmount), "Deposit return failed");
            
            emit EMICompleted(user, block.timestamp);
        }
    }
    
    function _adjustInstallmentsForEarlyPayment(uint256 earlyPaymentAmount) internal {
        uint256 remainingInstallments = termMonths - paymentsCompleted;
        if (remainingInstallments == 0) return;
        
        uint256 newMonthlyAmount = (remainingAmount - earlyPaymentAmount) / remainingInstallments;
        
        for (uint256 i = paymentsCompleted; i < termMonths; i++) {
            installments[i].amount = newMonthlyAmount;
        }
    }
    
    function getEMIDetails() external view returns (
        address userAddress,
        address merchantAddress,
        uint256 totalAmt,
        uint256 monthlyAmt,
        uint256 remainingPayments,
        uint256 nextPayment,
        EMIStatus emiStatus,
        uint256 depositAmt,
        bool depositStatus
    ) {
        return (
            user,
            merchant,
            totalAmount,
            monthlyAmount,
            termMonths - paymentsCompleted,
            nextPaymentDate,
            status,
            depositAmount,
            depositPaid
        );
    }
    
    function getInstallmentSchedule() external view returns (Installment[] memory) {
        return installments;
    }
    
    function getPaymentHistory() external view returns (PaymentRecord[] memory) {
        return paymentHistory;
    }
    
    function getStatus() external view returns (EMIStatus) {
        return status;
    }
    
    function checkOverduePayments() external view returns (uint256[] memory) {
        uint256[] memory overdueInstallments = new uint256[](termMonths);
        uint256 count = 0;
        
        for (uint256 i = 0; i < termMonths; i++) {
            if (installments[i].status == InstallmentStatus.Pending && 
                block.timestamp > installments[i].dueDate + GRACE_PERIOD) {
                overdueInstallments[count] = i + 1;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = overdueInstallments[i];
        }
        
        return result;
    }
    
    // Admin functions
    function pause() external onlyEMIManager {
        _pause();
    }
    
    function unpause() external onlyEMIManager {
        _unpause();
    }
    
    function markAsDefaulted() external onlyEMIManager {
        status = EMIStatus.Defaulted;
        userProfile.recordDefault(user, address(this));
    }
}