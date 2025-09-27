import React, { useState } from 'react';
import { CreditCard, Calendar, ArrowRight, TestTube } from 'lucide-react';
import CheckoutPage from './CheckoutPage';
import EMIFlow from './EMIFlow';
import Confirmation from './Confirmation';

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

  // Test order data - 2 PYUSD for Sepolia testing
  const orderData: OrderData = {
    items: [
      { name: 'Test Product', price: 2.00, quantity: 1 }
    ],
    total: 2.00,
    vendor: 'PayLater Test Store',
    orderId: 'TEST-001'
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
          <CreditCard className="w-16 h-16 text-black mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Payment Successful</h1>
          <p className="text-gray-600 mb-6">Your test payment has been processed successfully.</p>
          <button
            onClick={handleBackHome}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Testing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Test Mode Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <TestTube className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">Test Mode</h3>
            <p className="text-sm text-blue-700">
              This is a test environment using Sepolia testnet and test PYUSD tokens.
            </p>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default TestPaymentFlow;