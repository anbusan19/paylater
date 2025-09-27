import React, { useState } from 'react';
import EMIPlanSelection from './EMIPlanSelection';
import DepositCollection from './DepositCollection';
import InstallmentSchedule from './InstallmentSchedule';
import { ArrowLeft } from 'lucide-react';

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

interface EMIFlowProps {
  orderData: OrderData;
  onConfirm: (emiData: any) => void;
  onBack: () => void;
}

interface EMIPlan {
  id: string;
  term: number;
  monthlyAmount: number;
  totalAmount: number;
  label: string;
  interestRate: number;
}

interface DepositData {
  amount: number;
  percentage: number;
}

interface InstallmentData {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

type EMIStep = 'plan-selection' | 'deposit-collection' | 'schedule-review' | 'confirmation';

const EMIFlow: React.FC<EMIFlowProps> = ({ orderData, onConfirm, onBack }) => {
  const [currentStep, setCurrentStep] = useState<EMIStep>('plan-selection');
  const [selectedPlan, setSelectedPlan] = useState<EMIPlan | null>(null);
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  const [installmentSchedule, setInstallmentSchedule] = useState<InstallmentData[]>([]);

  const handlePlanSelected = (plan: EMIPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('deposit-collection');
  };

  const handleDepositConfirmed = (deposit: DepositData) => {
    setDepositData(deposit);
    
    // Generate installment schedule
    if (selectedPlan) {
      const schedule = generateInstallmentSchedule(selectedPlan, deposit);
      setInstallmentSchedule(schedule);
      setCurrentStep('schedule-review');
    }
  };

  const generateInstallmentSchedule = (plan: EMIPlan, deposit: DepositData): InstallmentData[] => {
    const schedule: InstallmentData[] = [];
    const remainingAmount = plan.totalAmount - deposit.amount;
    const monthlyAmount = remainingAmount / plan.term;
    
    for (let i = 1; i <= plan.term; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        installmentNumber: i,
        dueDate,
        amount: monthlyAmount,
        status: 'pending'
      });
    }
    
    return schedule;
  };

  const handleScheduleConfirmed = () => {
    const emiData = {
      plan: selectedPlan,
      deposit: depositData,
      schedule: installmentSchedule,
      orderData
    };
    onConfirm(emiData);
  };

  const handleBackStep = () => {
    switch (currentStep) {
      case 'deposit-collection':
        setCurrentStep('plan-selection');
        break;
      case 'schedule-review':
        setCurrentStep('deposit-collection');
        break;
      default:
        onBack();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'plan-selection':
        return 'Choose EMI Plan';
      case 'deposit-collection':
        return 'Security Deposit';
      case 'schedule-review':
        return 'Payment Schedule';
      default:
        return 'EMI Setup';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBackStep}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-black">{getStepTitle()}</h1>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${currentStep === 'plan-selection' ? 'bg-black' : 'bg-gray-300'}`} />
        <div className="flex-1 h-0.5 bg-gray-300">
          <div className={`h-full bg-black transition-all duration-300 ${
            currentStep === 'deposit-collection' || currentStep === 'schedule-review' ? 'w-full' : 'w-0'
          }`} />
        </div>
        <div className={`w-3 h-3 rounded-full ${currentStep === 'deposit-collection' ? 'bg-black' : 'bg-gray-300'}`} />
        <div className="flex-1 h-0.5 bg-gray-300">
          <div className={`h-full bg-black transition-all duration-300 ${
            currentStep === 'schedule-review' ? 'w-full' : 'w-0'
          }`} />
        </div>
        <div className={`w-3 h-3 rounded-full ${currentStep === 'schedule-review' ? 'bg-black' : 'bg-gray-300'}`} />
      </div>

      {/* Step Content */}
      {currentStep === 'plan-selection' && (
        <EMIPlanSelection
          orderData={orderData}
          onPlanSelected={handlePlanSelected}
        />
      )}

      {currentStep === 'deposit-collection' && selectedPlan && (
        <DepositCollection
          plan={selectedPlan}
          orderData={orderData}
          onDepositConfirmed={handleDepositConfirmed}
        />
      )}

      {currentStep === 'schedule-review' && selectedPlan && depositData && (
        <InstallmentSchedule
          plan={selectedPlan}
          deposit={depositData}
          schedule={installmentSchedule}
          orderData={orderData}
          onConfirm={handleScheduleConfirmed}
        />
      )}
    </div>
  );
};

export default EMIFlow;