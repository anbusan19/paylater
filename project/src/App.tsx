import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import CheckoutPage from './components/CheckoutPage';
import EMIFlow from './components/EMIFlow';
import Confirmation from './components/Confirmation';
import Header from './components/Header';
import TestPaymentFlow from './components/TestPaymentFlow';
import UserProfile from './components/UserProfile';
import { CheckCircle } from 'lucide-react';
import { contractService } from './services/contractService';

type AppState = 'landing' | 'checkout' | 'emi' | 'confirmation' | 'paid' | 'test' | 'profile';

interface OrderData {
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  total: number;
  vendor: string;
  orderId: string;
}

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [connectedWallet, setConnectedWallet] = useState<string>('');

  // Test order data - 2 PYUSD for Sepolia testing
  const orderData: OrderData = {
    items: [
      { name: 'Test Product', price: 2.00, quantity: 1 }
    ],
    total: 2.00,
    vendor: 'PayLater Test Store',
    orderId: 'TEST-001'
  };

  const handleGetStarted = () => {
    // For testing, go directly to test payment flow
    setCurrentState('test');
  };

  const handlePayNow = () => {
    // Mock instant payment
    setTimeout(() => {
      setCurrentState('paid');
    }, 1000);
  };

  const handleEMISelect = () => {
    setCurrentState('emi');
  };

  const handleEMIConfirm = async (emiData: any) => {
    setSelectedPlan(emiData);
    
    try {
      // Create EMI plan on blockchain
      const emiContractAddress = await contractService.createEMIPlan({
        user: connectedWallet,
        merchant: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e', // Mock merchant address
        totalAmount: orderData.total.toString(),
        termMonths: emiData.plan.term,
        interestRate: emiData.plan.interestRate * 100, // Convert to basis points
        depositAmount: emiData.deposit.amount.toString(),
        depositPercentage: emiData.deposit.percentage * 100 // Convert to basis points
      });
      
      console.log('EMI Contract created:', emiContractAddress);
      setCurrentState('confirmation');
    } catch (error) {
      console.error('Failed to create EMI plan:', error);
      alert('Failed to create EMI plan. Please try again.');
    }
  };

  const handleBackToCheckout = () => {
    setCurrentState('checkout');
  };

  const handleBackHome = () => {
    setCurrentState('landing');
    setSelectedPlan(null);
  };

  const handleWalletConnect = async (address: string) => {
    setConnectedWallet(address);
    console.log('Wallet connected:', address);
    
    try {
      await contractService.initialize();
    } catch (error) {
      console.error('Failed to initialize contract service:', error);
    }
  };

  const handleWalletDisconnect = () => {
    setConnectedWallet('');
    console.log('Wallet disconnected');
  };

  const handleViewProfile = () => {
    setCurrentState('profile');
  };

  if (currentState === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onWalletConnect={handleWalletConnect}
          onWalletDisconnect={handleWalletDisconnect}
        />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-black mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-black mb-2">Payment Successful</h1>
              <p className="text-gray-600">Your payment has been processed successfully.</p>
            </div>
            <button
              onClick={handleBackHome}
              className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentState === 'landing') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onWalletConnect={handleWalletConnect}
          onWalletDisconnect={handleWalletDisconnect}
        />
        <LandingPage onGetStarted={handleGetStarted} />
      </div>
    );
  }

  if (currentState === 'test') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onWalletConnect={handleWalletConnect}
          onWalletDisconnect={handleWalletDisconnect}
          connectedWallet={connectedWallet}
          onViewProfile={handleViewProfile}
        />
        <TestPaymentFlow />
      </div>
    );
  }

  if (currentState === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onWalletConnect={handleWalletConnect}
          onWalletDisconnect={handleWalletDisconnect}
          connectedWallet={connectedWallet}
          onViewProfile={handleViewProfile}
        />
        <main className="max-w-4xl mx-auto p-4">
          <UserProfile walletAddress={connectedWallet} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onWalletConnect={handleWalletConnect}
        onWalletDisconnect={handleWalletDisconnect}
      />

      <main className="max-w-md mx-auto p-4">
        {currentState === 'checkout' && (
          <CheckoutPage
            orderData={orderData}
            onPayNow={handlePayNow}
            onEMISelect={handleEMISelect}
          />
        )}

        {currentState === 'emi' && (
          <EMIFlow
            orderData={orderData}
            onConfirm={handleEMIConfirm}
            onBack={handleBackToCheckout}
          />
        )}

        {currentState === 'confirmation' && selectedPlan && (
          <Confirmation
            plan={selectedPlan}
            orderData={orderData}
            onBackHome={handleBackHome}
          />
        )}
      </main>
    </div>
  );
}

export default App;