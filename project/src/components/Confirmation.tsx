import React from 'react';
import { CheckCircle, Calendar, DollarSign } from 'lucide-react';

interface ConfirmationProps {
  plan: {
    term: number;
    monthlyAmount: number;
    totalAmount: number;
    label: string;
  };
  orderData: {
    total: number;
  };
  onBackHome: () => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({ plan, orderData, onBackHome }) => {
  const generateRepaymentSchedule = () => {
    const schedule = [];
    const today = new Date();
    
    for (let i = 1; i <= plan.term; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);
      
      schedule.push({
        month: i,
        amount: plan.monthlyAmount,
        dueDate: dueDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      });
    }
    
    return schedule;
  };

  const schedule = generateRepaymentSchedule();

  return (
    <div className="space-y-6 py-6">
      {/* Success Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <CheckCircle className="w-16 h-16 text-black mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-black mb-2">EMI Approved!</h1>
        <p className="text-gray-600">Your payment plan has been successfully set up</p>
      </div>

      {/* Plan Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-black mb-4">Payment Plan Summary</h2>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Purchase Amount</span>
            <span className="font-medium text-black">${orderData.total.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Plan Duration</span>
            <span className="font-medium text-black">{plan.label}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Monthly Payment</span>
            <div className="flex items-center space-x-1 text-black">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold">${plan.monthlyAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Amount</span>
              <span className="font-bold text-black">${plan.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-black" />
          <h2 className="text-lg font-bold text-black">Repayment Schedule</h2>
        </div>
        
        <div className="space-y-3">
          {schedule.map((payment) => (
            <div 
              key={payment.month}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div>
                <span className="font-medium text-black">Payment {payment.month}</span>
                <p className="text-sm text-gray-600">{payment.dueDate}</p>
              </div>
              <span className="font-bold text-black">${payment.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={onBackHome}
          className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          You will receive email reminders before each payment is due
        </p>
      </div>
    </div>
  );
};

export default Confirmation;