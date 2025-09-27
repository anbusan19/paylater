import React, { useState } from 'react';
import WalletCreation from './WalletCreation';
import WalletVerification from './WalletVerification';
import EMIPlanSelection from './EMIPlanSelection';
import StepIndicator from './StepIndicator';
import { ArrowLeft } from 'lucide-react';

interface OrderData {
  items: Array<{
    name: string;
    price: number;
  }>;
  total: number;
}

interface EMIFlowProps {
  orderData: OrderData;
  onConfirm: (plan: any) => void;
  onBack: () => void;
}

type EMIStep = 'wallet-creation' | 'wallet-verification' | 'plan-selection';

const EMIFlow: React.FC<EMIFlowProps> = ({ orderData, onConfirm, onBack }) => {
  const [currentStep, setCurrentStep] = useState<EMIStep>('wallet-creation');
  const [walletData, setWalletData] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);

  const steps = [
    { id: 'wallet-creation', label: 'Create Wallet' },
    { id: 'wallet-verification', label: 'Verify Identity' },
    { id: 'plan-selection', label: 'Select Plan' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleWalletCreated = (data: any) => {
    setWalletData(data);
    setCurrentStep('wallet-verification');
  };

  const handleWalletVerified = () => {
    setIsVerified(true);
    setCurrentStep('plan-selection');
  };

  const handlePlanSelected = (plan: any) => {
    onConfirm(plan);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <StepIndicator 
          currentStep={currentStepIndex + 1} 
          totalSteps={steps.length} 
        />
      </div>

      {/* Decorative Pattern */}
      <div className="relative">
        <div className="absolute top-0 right-4 w-40 h-40 opacity-10">
          <div className="w-full h-full bg-black rounded-full transform translate-x-1/2 -translate-y-1/4"></div>
        </div>
        <div className="absolute top-12 left-8 w-32 h-32 opacity-5">
          <div 
            className="w-full h-full bg-black"
            style={{
              backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)',
              backgroundSize: '6px 6px'
            }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="relative z-10">
        {currentStep === 'wallet-creation' && (
          <WalletCreation onWalletCreated={handleWalletCreated} />
        )}
        
        {currentStep === 'wallet-verification' && (
          <WalletVerification 
            walletData={walletData} 
            onVerified={handleWalletVerified} 
          />
        )}
        
        {currentStep === 'plan-selection' && (
          <EMIPlanSelection 
            orderData={orderData}
            onPlanSelected={handlePlanSelected} 
          />
        )}
      </div>
    </div>
  );
};

export default EMIFlow;