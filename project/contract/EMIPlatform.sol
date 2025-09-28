// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Minimal ERC20 interface declared at top level
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title EMI Platform (ERC20-based) - pay full or pay in installments every 5 days
/// @notice Simple EMI/PayNow conatract using ERC20 tokens (e.g., PYUSD). Buyer must approve() token allowance to this contract.
contract EMIPlatform {
    uint256 public nextLoanId;
    uint256 public constant INTERVAL = 5 days; // installment interval

    struct Loan {
        address buyer;          // who will pay
        address seller;         // who receives funds
        address token;          // ERC20 token used (e.g. PYUSD)
        uint256 totalAmount;    // total amount to be paid
        uint8 installments;     // total number of installments
        uint8 installmentsPaid; // count of installments paid
        uint256 paidAmount;     // total paid so far
        uint256 installmentAmount; // nominal installment amount (integer division)
        uint256 createdAt;
        uint256 nextDue;        // timestamp when next installment becomes due (first due = createdAt)
        bool active;            // true if loan is active / not fully paid
    }

    mapping(uint256 => Loan) public loans;

    // seller => token => withdrawable balance
    mapping(address => mapping(address => uint256)) public sellerBalances;

    // Events
    event LoanCreated(uint256 indexed loanId, address indexed buyer, address indexed seller, address token, uint256 totalAmount, uint8 installments);
    event InstallmentPaid(uint256 indexed loanId, address indexed payer, uint256 amount, uint8 installmentsPaid, uint256 nextDue);
    event PaidInFull(uint256 indexed loanId, address indexed payer, uint256 amount);
    event SellerWithdraw(address indexed seller, address indexed token, uint256 amount);

    /// @notice Create an EMI loan. Caller becomes the buyer. Seller is the recipient of the payments.
    /// @param seller Address of the merchant who will receive payments
    /// @param token ERC20 token address (e.g., PYUSD)
    /// @param totalAmount Total amount (token smallest units)
    /// @param installments Number of installments (must be >=1). If 1, behaves like pay-now but recorded as EMI.
    /// @dev Buyer must call token.approve(thisContract, amount) before calling payInstallment/payNow.
    function createLoan(address seller, address token, uint256 totalAmount, uint8 installments) external returns (uint256) {
        require(seller != address(0), "Invalid seller");
        require(token != address(0), "Invalid token");
        require(totalAmount > 0, "Total amount must be > 0");
        require(installments >= 1, "installments must be >= 1");

        uint256 id = ++nextLoanId;

        // compute installment amount (integer division). Last installment will cover remainder.
        uint256 baseInstallment = totalAmount / installments;

        loans[id] = Loan({
            buyer: msg.sender,
            seller: seller,
            token: token,
            totalAmount: totalAmount,
            installments: installments,
            installmentsPaid: 0,
            paidAmount: 0,
            installmentAmount: baseInstallment,
            createdAt: block.timestamp,
            nextDue: block.timestamp, // first installment can be paid immediately
            active: true
        });

        emit LoanCreated(id, msg.sender, seller, token, totalAmount, installments);
        return id;
    }

    /// @notice Buyer (or anyone on behalf of buyer) pays the next installment for a loan.
    /// @param loanId ID of the loan
    /// @dev Buyer must approve `installmentAmount` (or remaining amount for last installment) to this contract.
    function payInstallment(uint256 loanId) external {
        Loan storage L = loans[loanId];
        require(L.active, "Loan inactive or paid");
        require(L.paidAmount < L.totalAmount, "Loan already fully paid");
        require(block.timestamp >= L.nextDue, "Installment not due yet");

        uint256 thisInstallment;
        // If this is last installment, include remainder
        if (uint256(L.installmentsPaid) + 1 == L.installments) {
            // last installment = remaining amount
            thisInstallment = L.totalAmount - L.paidAmount;
        } else {
            thisInstallment = L.installmentAmount;
        }

        require(thisInstallment > 0, "Zero installment");

        IERC20 token = IERC20(L.token);
        // transfer tokens from payer (usually buyer) to contract
        bool ok = token.transferFrom(L.buyer, address(this), thisInstallment);
        require(ok, "ERC20 transferFrom failed");

        // update accounting
        L.paidAmount += thisInstallment;
        L.installmentsPaid += 1;
        // schedule next due
        L.nextDue = L.nextDue + INTERVAL;

        // credit seller withdrawable balance
        sellerBalances[L.seller][L.token] += thisInstallment;

        emit InstallmentPaid(loanId, msg.sender, thisInstallment, L.installmentsPaid, L.nextDue);

        // if fully paid, mark inactive
        if (L.paidAmount >= L.totalAmount) {
            L.active = false;
            emit PaidInFull(loanId, msg.sender, L.paidAmount);
        }
    }

    /// @notice Buyer (or anyone on buyer's behalf) pays the remaining amount in one go to settle the loan instantly.
    /// @param loanId ID of the loan
    function payNow(uint256 loanId) external {
        Loan storage L = loans[loanId];
        require(L.active, "Loan inactive or paid");
        require(L.paidAmount < L.totalAmount, "Already paid");

        uint256 remaining = L.totalAmount - L.paidAmount;
        require(remaining > 0, "Nothing to pay");

        IERC20 token = IERC20(L.token);
        bool ok = token.transferFrom(L.buyer, address(this), remaining);
        require(ok, "ERC20 transferFrom failed");

        // update accounting
        L.paidAmount = L.totalAmount;
        L.installmentsPaid = L.installments;
        L.active = false;

        // credit seller
        sellerBalances[L.seller][L.token] += remaining;

        emit PaidInFull(loanId, msg.sender, remaining);
    }

    /// @notice Seller withdraws their accumulated token balance
    /// @param token ERC20 token address
    function sellerWithdraw(address token) external {
        uint256 bal = sellerBalances[msg.sender][token];
        require(bal > 0, "No balance to withdraw");
        sellerBalances[msg.sender][token] = 0;

        IERC20 erc = IERC20(token);
        bool ok = erc.transfer(msg.sender, bal);
        require(ok, "ERC20 transfer failed");

        emit SellerWithdraw(msg.sender, token, bal);
    }

    /// @notice View remaining amount for loan
    function remainingAmount(uint256 loanId) external view returns (uint256) {
        Loan storage L = loans[loanId];
        if (!L.active) return 0;
        return L.totalAmount - L.paidAmount;
    }

    /// @notice Helper getter for loan details
    function getLoan(uint256 loanId) external view returns (
        address buyer, address seller, address token, uint256 totalAmount,
        uint8 installments, uint8 installmentsPaid, uint256 paidAmount, uint256 installmentAmount,
        uint256 createdAt, uint256 nextDue, bool active
    ) {
        Loan storage L = loans[loanId];
        return (
            L.buyer, L.seller, L.token, L.totalAmount,
            L.installments, L.installmentsPaid, L.paidAmount, L.installmentAmount,
            L.createdAt, L.nextDue, L.active
        );
    }
}
