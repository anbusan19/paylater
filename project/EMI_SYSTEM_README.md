# PayLater EMI System

A comprehensive blockchain-based EMI (Equated Monthly Installment) system built on Ethereum with PYUSD integration.

## 🚀 Features

### Core EMI Functionality
- **Flexible Payment Plans**: 3, 6, and 12-month installment options
- **Security Deposits**: 5-50% deposit requirement to secure EMI plans
- **Dynamic Interest Rates**: Credit score-based interest calculation
- **Automated Payments**: Smart contract-based payment processing
- **Early Payment Options**: Reduce interest with early payments

### User Experience
- **Wallet Integration**: MetaMask support for seamless transactions
- **Real-time Tracking**: Live payment schedules and history
- **Credit Scoring**: Dynamic credit score based on payment behavior
- **User Profiles**: Comprehensive EMI history and analytics

### Security & Compliance
- **Smart Contract Security**: OpenZeppelin-based secure contracts
- **Liquidity Pool**: Decentralized funding mechanism
- **Merchant Authorization**: Verified merchant system
- **Deposit Protection**: Refundable security deposits

## 🏗️ Architecture

### Smart Contracts

#### 1. EMIManager.sol
- Central contract managing EMI creation and eligibility
- Handles merchant authorization and user verification
- Calculates dynamic interest rates based on credit scores

#### 2. EMIContract.sol
- Individual EMI plan management
- Handles deposits, installments, and early payments
- Tracks payment schedules and status

#### 3. UserProfile.sol
- User credit scoring and history tracking
- Payment behavior analytics
- Profile management and verification

#### 4. LiquidityPool.sol
- Decentralized funding for EMI plans
- Liquidity provider rewards system
- Risk management and pool statistics

### Frontend Components

#### Core Components
- **EMIFlow**: Multi-step EMI creation process
- **EMIPlanSelection**: Plan comparison and selection
- **DepositCollection**: Security deposit handling
- **InstallmentSchedule**: Payment timeline visualization
- **UserProfile**: Comprehensive user dashboard

#### Integration
- **ContractService**: Web3 integration layer
- **Real-time Updates**: Live blockchain data synchronization
- **Error Handling**: Comprehensive error management

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 16+
- MetaMask wallet
- Sepolia testnet ETH
- PYUSD testnet tokens

### Frontend Setup
```bash
cd project
npm install
npm run dev
```

### Contract Deployment
```bash
# Install contract dependencies
npm install -g hardhat
cd project
npm install --save-dev @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

# Configure environment
cp .env.example .env
# Add your private key and RPC URLs

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### Environment Variables
```env
REACT_APP_PYUSD_ADDRESS=0x6f14C02fC1F78322cFd7d707aB90f18baD3B54f5
REACT_APP_EMI_MANAGER_ADDRESS=<deployed_address>
REACT_APP_USER_PROFILE_ADDRESS=<deployed_address>
REACT_APP_LIQUIDITY_POOL_ADDRESS=<deployed_address>
SEPOLIA_RPC_URL=<your_rpc_url>
PRIVATE_KEY=<your_private_key>
ETHERSCAN_API_KEY=<your_api_key>
```

## 💳 How It Works

### 1. EMI Plan Creation
1. User selects "Pay with EMI" option
2. Chooses payment term (3, 6, or 12 months)
3. System verifies eligibility based on credit score
4. User selects deposit amount (5-50% of purchase)
5. Smart contract creates EMI plan with installment schedule

### 2. Deposit Payment
1. User pays security deposit to activate EMI
2. Liquidity pool transfers full amount to merchant
3. EMI contract tracks deposit and activates plan
4. First installment due date is set (30 days from activation)

### 3. Monthly Payments
1. Automated payment reminders sent before due dates
2. Users can pay manually or enable auto-pay
3. Payments processed through smart contracts
4. Late fees applied after grace period (3 days)
5. Credit score updated based on payment behavior

### 4. Early Payment & Completion
1. Users can make early payments to reduce interest
2. Full early payment completes EMI immediately
3. Security deposit returned upon successful completion
4. Credit score boosted for successful completion

## 📊 Credit Scoring System

### Initial Score
- New users start with 650 credit score
- Score range: 300-850

### Score Adjustments
- **On-time payments**: +2 points per payment
- **Early payments**: +5 points per payment
- **Late payments**: -10 points per payment
- **EMI completion**: +10 points
- **Default**: -100 points

### Eligibility Criteria
- Minimum credit score: 600
- Maximum active EMIs: 5
- Credit-based spending limits

## 🔒 Security Features

### Smart Contract Security
- ReentrancyGuard protection
- Pausable contracts for emergency stops
- Access control with role-based permissions
- Input validation and bounds checking

### Financial Security
- Security deposits protect against defaults
- Liquidity pool diversification
- Automated risk assessment
- Real-time monitoring and alerts

## 🧪 Testing

### Test Environment
- Sepolia testnet deployment
- Test PYUSD tokens available
- Mock merchant integration
- Comprehensive test scenarios

### Test Scenarios
1. **Basic EMI Flow**: Complete EMI creation and payment
2. **Deposit Variations**: Test different deposit percentages
3. **Payment Scenarios**: On-time, late, and early payments
4. **Edge Cases**: Insufficient funds, contract pausing
5. **Credit Scoring**: Score changes based on behavior

## 📈 Analytics & Monitoring

### User Analytics
- Payment history tracking
- Credit score progression
- EMI performance metrics
- Financial health indicators

### System Analytics
- Total EMIs created and completed
- Default rates and risk metrics
- Liquidity pool performance
- Interest earnings and distributions

## 🚀 Future Enhancements

### Planned Features
- **Multi-token Support**: Support for additional stablecoins
- **Insurance Integration**: Payment protection insurance
- **Credit Reporting**: Integration with traditional credit bureaus
- **Mobile App**: Native mobile application
- **Advanced Analytics**: ML-based risk assessment

### Scalability
- Layer 2 integration for lower gas costs
- Cross-chain compatibility
- Enterprise merchant tools
- API for third-party integrations

## 🤝 Contributing

### Development Guidelines
1. Follow Solidity best practices
2. Comprehensive test coverage required
3. Gas optimization considerations
4. Security audit recommendations

### Code Structure
```
project/
├── contracts/          # Smart contracts
├── src/
│   ├── components/     # React components
│   ├── services/       # Web3 integration
│   └── contracts/      # Contract interfaces
├── scripts/           # Deployment scripts
└── test/             # Contract tests
```

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Check the troubleshooting guide
- Review the testing documentation

## 🔗 Links

- [PYUSD Documentation](https://paxos.com/pyusd/)
- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- [MetaMask Setup Guide](https://metamask.io/download/)
- [Hardhat Documentation](https://hardhat.org/docs)

---

Built with ❤️ for the future of decentralized finance