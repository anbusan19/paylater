import React, { useState } from 'react';
import { Shield, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

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
  label: string;
  interestRate: number;
}

interface DepositCollectionProps {
  plan: EMIPlan;
  orderData: OrderData;
  onDepositConfirmed: (deposit: { amount: number; percentage: number }) => void;
}

const DepositCollection: React.FC<DepositCollectionProps> = ({ 
  plan, 
  orderData, 
  onDepositConfirmed 
}) => {
  const [selectedPercentage, setSelectedPercentage] = useState<number>(20);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);

  const depositOptions = [
    { percentage: 10, label: '10%' },
    { percentage: 15, label: '15%' },
    { percentage: 20, label: '20%' },
    { percentage: 25, label: '25%' },
    { percentage: 30, label: '30%' }
  ];

  const calculateDepositAmount = () => {
    if (useCustomAmount) {
      return parseFloat(customAmount) || 0;
    }
    return (orderData.total * selectedPercentage) / 100;
  };

  const calculateRemainingAmount = () => {
    return plan.totalAmount - calculateDepositAmount();
  };

  const calculateNewMonthlyAmount = () => {
    return calculateRemainingAmount() / plan.term;
  };

  const handleConfirm = () => {
    const depositAmount = calculateDepositAmount();
    const percentage = useCustomAmount 
      ? (depositAmount / orderData.total) * 100 
      : selectedPercentage;

    if (depositAmount < orderData.total * 0.05) {
      alert('Minimum deposit is 5% of the purchase amount');
      return;
    }

    if (depositAmount >= orderData.total) {
      alert('Deposit cannot be equal to or greater than the purchase amount');
      return;
    }

    onDepositConfirmed({
      amount: depositAmount,
      percentage: percentage
    });
  };

  const isValidCustomAmount = () => {
    const amount = parseFloat(customAmount);
    return amount >= orderData.total * 0.05 && amount < orderData.total;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-black mx-auto mb-4" />
        <h2 className="text-xl font-bold text-black mb-2">Security Deposit</h2>
        <p className="text-gray-600">
          Pay a deposit to secure your EMI plan and reduce monthly payments
        </p>
      </div>

      {/* Plan Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">Selected Plan</span>
          <span className="font-bold text-black">{plan.label}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">Purchase Amount</span>
          <span className="font-bold text-black">${orderData.total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Total with Interest</span>
          <span className="font-bold text-black">${plan.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Deposit Options */}
      <div className="mb-6">
        <h3 className="font-medium text-black mb-4">Choose Deposit Amount</h3>
        
        {/* Percentage Options */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {depositOptions.map((option) => (
            <button
              key={option.percentage}
              onClick={() => {
                setSelectedPercentage(option.percentage);
                setUseCustomAmount(false);
              }}
              className={`p-3 text-center border-2 rounded-xl transition-colors ${
                !useCustomAmount && selectedPercentage === option.percentage
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-black">{option.label}</div>
              <div className="text-sm text-gray-600">
                ${((orderData.total * option.percentage) / 100).toFixed(2)}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amount Option */}
        <div className="border-2 border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="radio"
              id="custom"
              checked={useCustomAmount}
              onChange={() => setUseCustomAmount(true)}
              className="w-4 h-4"
            />
            <label htmlFor="custom" className="font-medium text-black">
              Custom Amount
            </label>
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setUseCustomAmount(true);
              }}
              placeholder="Enter amount"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              min={orderData.total * 0.05}
              max={orderData.total * 0.95}
              step="0.01"
            />
          </div>
          {useCustomAmount && customAmount && !isValidCustomAmount() && (
            <div className="flex items-center space-x-2 mt-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Amount must be between ${(orderData.total * 0.05).toFixed(2)} and ${(orderData.total * 0.95).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Impact */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-medium text-black mb-3">Impact on Your Payments</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Deposit Amount</span>
            <span className="font-bold text-black">${calculateDepositAmount().toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Remaining Amount</span>
            <span className="font-bold text-black">${calculateRemainingAmount().toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">New Monthly Payment</span>
            <span className="font-bold text-green-600">${calculateNewMonthlyAmount().toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Savings per month</span>
            <span className="font-medium text-green-600">
              -${(plan.monthlyAmount - calculateNewMonthlyAmount()).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-6 p-4 bg-green-50 rounded-xl">
        <h4 className="font-medium text-black mb-3 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Deposit Benefits</span>
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Lower monthly payments</li>
          <li>• Improved credit score impact</li>
          <li>• Reduced total interest paid</li>
          <li>• Priority customer support</li>
        </ul>
      </div>

      <button
        onClick={handleConfirm}
        disabled={useCustomAmount && !isValidCustomAmount()}
        className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm Deposit - ${calculateDepositAmount().toFixed(2)}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your deposit will be processed securely and applied to your EMI plan immediately.
      </p>
    </div>
  );
};

export default DepositCollection;