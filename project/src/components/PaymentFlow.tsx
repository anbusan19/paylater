import React, { useState } from 'react';
import PaymentPage from './PaymentPage';
import InstantPaymentPage from './InstantPaymentPage';
import EMIPaymentPage from './EMIPaymentPage';
import PaymentSuccessPage from './PaymentSuccessPage';
import PaymentFailedPage from './PaymentFailedPage';

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

interface EMIPlan {
  id: string;
  term: number;
  monthlyAmount: number;
  totalAmount: number;
  interestRate: number;
  label: string;
}

interface PaymentFlowProps {
  orderData: OrderData;
  onComplete?: () => void;
}

type FlowStep = 'payment' | 'instant' | 'emi' | 'success' | 'failed';

const PaymentFlow: React.FC<PaymentFlowProps> = ({ orderData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('payment');
  const [paymentType, setPaymentType] = useState<'instant' | 'emi'>('instant');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [emiPlan, setEmiPlan] = useState<EMIPlan | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleInstantPayment = () => {
    setPaymentType('instant');
    setCurrentStep('instant');
  };

  const handleEMIPayment = () => {
    setPaymentType('emi');
    setCurrentStep('emi');
  };

  const handlePaymentSuccess = (txHash: string) => {
    setTransactionHash(txHash);
    setCurrentStep('success');
  };

  const handleEMISuccess = (plan: EMIPlan, wallet: string) => {
    setEmiPlan(plan);
    setWalletAddress(wallet);
    setCurrentStep('success');
  };

  const handlePaymentFailed = (errorMessage: string) => {
    setError(errorMessage);
    setCurrentStep('failed');
  };

  const handleRetry = () => {
    setError('');
    if (paymentType === 'instant') {
      setCurrentStep('instant');
    } else {
      setCurrentStep('emi');
    }
  };

  const handleBackToPayment = () => {
    setCurrentStep('payment');
    setError('');
    setTransactionHash('');
    setEmiPlan(null);
    setWalletAddress('');
  };

  const handleNewPayment = () => {
    setCurrentStep('payment');
    setPaymentType('instant');
    setTransactionHash('');
    setEmiPlan(null);
    setWalletAddress('');
    setError('');
  };

  const handleViewDashboard = () => {
    // Navigate to EMI dashboard
    console.log('Navigate to EMI dashboard');
  };

  const handleContactSupport = () => {
    // Open support contact
    console.log('Contact support');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'payment':
        return (
          <PaymentPage
            orderData={orderData}
            onInstantPayment={handleInstantPayment}
            onEMIPayment={handleEMIPayment}
          />
        );

      case 'instant':
        return (
          <InstantPaymentPage
            orderData={orderData}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
            onBack={handleBackToPayment}
          />
        );

      case 'emi':
        return (
          <EMIPaymentPage
            orderData={orderData}
            onEMISuccess={handleEMISuccess}
            onEMIFailed={handlePaymentFailed}
            onBack={handleBackToPayment}
          />
        );

      case 'success':
        return (
          <PaymentSuccessPage
            orderData={orderData}
            paymentType={paymentType}
            transactionHash={transactionHash}
            emiPlan={emiPlan || undefined}
            walletAddress={walletAddress}
            onNewPayment={handleNewPayment}
            onViewDashboard={paymentType === 'emi' ? handleViewDashboard : undefined}
          />
        );

      case 'failed':
        return (
          <PaymentFailedPage
            orderData={orderData}
            paymentType={paymentType}
            error={error}
            onRetry={handleRetry}
            onBack={handleBackToPayment}
            onContactSupport={handleContactSupport}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default PaymentFlow;