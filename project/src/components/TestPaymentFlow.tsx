import { AlertCircle, CreditCard, TestTube } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PaymentService } from '../utils/paymentService';
import CheckoutPage from './CheckoutPage';
import Confirmation from './Confirmation';
import EMIFlow from './EMIFlow';

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

type TestState = 'checkout' | 'emi' | 'confirmation' | 'paid';

const TestPaymentFlow: React.FC = () => {
  const [currentState, setCurrentState] = useState<TestState>('checkout');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    // Connect to MetaMask and get user's address
    const connectWallet = async () => {
      try {
        const provider = window.ethereum;
        if (!provider) {
          setError('Please install MetaMask to use this feature');
          return;
        }

        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        
        // Verify PYUSD contract
        const contractStatus = await PaymentService.verifyPYUSDContract();
        if (!contractStatus.isValid) {
          setError(`Contract verification failed: ${contractStatus.error}`);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to connect wallet');
      }
    };

    connectWallet();
  }, []);

  // Test order data - 2 PYUSD for Sepolia testing
  const orderData: OrderData = {
    items: [
      { name: 'Test Product', price: 2.00, quantity: 1 }
    ],
    total: 2.00,
    vendor: 'PayLater Test Store',
    orderId: 'TEST-001'
  };

  const handlePayNow = async () => {
    if (!userAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Check if user has sufficient balance
      const hasSufficientBalance = await PaymentService.checkSufficientBalance(
        userAddress,
        orderData.total
      );

      if (!hasSufficientBalance) {
        throw new Error('Insufficient PYUSD balance');
      }

      // Process the payment
      const result = await PaymentService.processInstantPayment(
        userAddress,
        orderData.total
      );

      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }

      setCurrentState('paid');
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEMISelect = () => {
    setCurrentState('emi');
  };

  const handleEMIConfirm = (emiData: any) => {
    setSelectedPlan(emiData);
    setCurrentState('confirmation');
  };

  const handleBackToCheckout = () => {
    setCurrentState('checkout');
  };

  const handleBackHome = () => {
    setCurrentState('checkout');
    setSelectedPlan(null);
  };

  if (currentState === 'paid') {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <CreditCard className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Payment Successful</h1>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully on the Sepolia network.
          </p>
          <button
            onClick={handleBackHome}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Testnet Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <TestTube className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">Sepolia Testnet</h3>
            <p className="text-sm text-blue-700">
              {userAddress ? 
                `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 
                'Please connect your MetaMask wallet'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Message */}
      {isProcessing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-900">Processing</h3>
              <p className="text-sm text-yellow-700">
                Please confirm the transaction in MetaMask...
              </p>
            </div>
          </div>
        </div>
      )}

      {currentState === 'checkout' && (
        <CheckoutPage
          orderData={orderData}
          onPayNow={handlePayNow}
          onEMISelect={handleEMISelect}
          isProcessing={isProcessing}
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
    </div>
  );
};

export default TestPaymentFlow;