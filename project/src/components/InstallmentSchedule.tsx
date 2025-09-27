import React from 'react';
import { Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

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

interface InstallmentScheduleProps {
  plan: EMIPlan;
  deposit: DepositData;
  schedule: InstallmentData[];
  orderData: OrderData;
  onConfirm: () => void;
}

const InstallmentSchedule: React.FC<InstallmentScheduleProps> = ({
  plan,
  deposit,
  schedule,
  orderData,
  onConfirm
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const totalScheduledAmount = schedule.reduce((sum, installment) => sum + installment.amount, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-black mx-auto mb-4" />
        <h2 className="text-xl font-bold text-black mb-2">Payment Schedule</h2>
        <p className="text-gray-600">
          Review your installment plan and payment dates
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-medium text-black mb-3">EMI Summary</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Purchase Amount</span>
            <span className="font-bold text-black">${orderData.total.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Security Deposit</span>
            <span className="font-bold text-green-600">-${deposit.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Remaining Amount</span>
            <span className="font-bold text-black">${totalScheduledAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Total Payments</span>
            <span className="font-bold text-black">{plan.term} months</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-700">Monthly Payment</span>
            <span className="font-bold text-black">${(totalScheduledAmount / plan.term).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="mb-6">
        <h3 className="font-medium text-black mb-4">Installment Schedule</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {schedule.map((installment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(installment.status)}
                <div>
                  <div className="font-medium text-black">
                    Payment #{installment.installmentNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    Due: {formatDate(installment.dueDate)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-black flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{installment.amount.toFixed(2)}</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(installment.status)}`}>
                  {installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-medium text-black mb-3">Important Information</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Payments are automatically deducted on due dates</li>
          <li>• Late payments may incur additional fees</li>
          <li>• You can make early payments to reduce interest</li>
          <li>• Payment reminders will be sent 3 days before due date</li>
          <li>• Your deposit is refundable upon successful completion</li>
        </ul>
      </div>

      {/* Auto-pay Setup */}
      <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-black">Enable Auto-Pay</h4>
            <p className="text-sm text-gray-600">Never miss a payment with automatic deduction</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
      >
        Confirm EMI Plan
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By confirming, you agree to the payment schedule and terms outlined above.
      </p>
    </div>
  );
};

export default InstallmentSchedule;