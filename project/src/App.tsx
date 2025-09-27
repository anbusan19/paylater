import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import CheckoutPage from './components/CheckoutPage';
import EMIFlow from './components/EMIFlow';
import Confirmation from './components/Confirmation';
import { CheckCircle } from 'lucide-react';

type AppState = 'landing' | 'checkout' | 'emi' | 'confirmation' | 'paid';

interface OrderData {
  items: Array<{
    name: string;
    price: number;
  }>;
  total: number;
}

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Mock order data
  const orderData: OrderData = {
    items: [
      { name: 'Premium Subscription', price: 299.99 },
      { name: 'Additional Features', price: 49.99 }
    ],
    total: 349.98
  };

  const handleGetStarted = () => {
    setCurrentState('checkout');
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

  const handleEMIConfirm = (plan: any) => {
    setSelectedPlan(plan);
    setCurrentState('confirmation');
  };

  const handleBackToCheckout = () => {
    setCurrentState('checkout');
  };

  const handleBackHome = () => {
    setCurrentState('landing');
    setSelectedPlan(null);
  };

  if (currentState === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
    );
  }

  if (currentState === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setCurrentState('landing')}
            className="text-xl font-bold text-black hover:text-gray-700 transition-colors"
          >
            PayLater
          </button>
        </div>
      </header>

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