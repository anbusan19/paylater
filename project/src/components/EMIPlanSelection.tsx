import React, { useState } from 'react';
import { Calendar, DollarSign, CreditCard } from 'lucide-react';

interface OrderData {
  items: Array<{
    name: string;
    price: number;
  }>;
  total: number;
}

interface EMIPlan {
  id: string;
  term: number;
  monthlyAmount: number;
  totalAmount: number;
  label: string;
  interestRate: number;
}

interface EMIPlanSelectionProps {
  orderData: OrderData;
  onPlanSelected: (plan: EMIPlan) => void;
}

const EMIPlanSelection: React.FC<EMIPlanSelectionProps> = ({ orderData, onPlanSelected }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const calculateMonthlyAmount = (months: number) => {
    const interestRate = 0.12; // 12% annual
    const monthlyRate = interestRate / 12;
    const amount = orderData.total;
    
    if (months === 0) return amount;
    
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    
    return monthlyPayment;
  };

  const plans: EMIPlan[] = [
    {
      id: '3months',
      term: 3,
      monthlyAmount: calculateMonthlyAmount(3),
      totalAmount: calculateMonthlyAmount(3) * 3,
      label: '3 Months',
      interestRate: 0.12
    },
    {
      id: '6months',
      term: 6,
      monthlyAmount: calculateMonthlyAmount(6),
      totalAmount: calculateMonthlyAmount(6) * 6,
      label: '6 Months',
      interestRate: 0.12
    },
    {
      id: '12months',
      term: 12,
      monthlyAmount: calculateMonthlyAmount(12),
      totalAmount: calculateMonthlyAmount(12) * 12,
      label: '12 Months',
      interestRate: 0.14
    }
  ];

  const handleConfirm = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan) {
      onPlanSelected(plan);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-black mx-auto mb-4" />
        <h2 className="text-xl font-bold text-black mb-2">Choose Your EMI Plan</h2>
        <p className="text-gray-600">Select a payment plan that works for you</p>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Purchase Amount</span>
          <span className="font-bold text-black">${orderData.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`w-full p-4 text-left border-2 rounded-xl transition-colors ${
              selectedPlan === plan.id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-black">{plan.label}</h3>
              <div className="flex items-center space-x-1 text-black">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">{plan.monthlyAmount.toFixed(2)}/mo</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{plan.term} monthly payments</span>
              <span>Total: ${plan.totalAmount.toFixed(2)}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selectedPlan}
        className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        Confirm EMI Plan
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Interest rate: 12% per annum. Terms and conditions apply.
      </p>
    </div>
  );
};

export default EMIPlanSelection;