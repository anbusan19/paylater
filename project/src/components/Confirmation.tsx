import { ArrowRight, Calendar, CheckCircle, CreditCard, DollarSign } from 'lucide-react';
import React, { useState } from 'react';
import { PaymentService } from '../utils/paymentService';

declare global {
  interface Window {
    ethereum?: any;
  }
}

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

interface ConfirmationProps {
  plan: any; // EMI data from the flow
  orderData: OrderData;
  onBackHome: () => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({ plan, orderData, onBackHome }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const handlePayDeposit = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to proceed with the payment.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get the current user's address
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];

      // Initialize payment service for the PYUSD transfer
      const paymentResult = await PaymentService.processInstantPayment(
        userAddress, 
        plan.deposit.amount
      );

      if (paymentResult.success && paymentResult.transactionHash) {
        setTransactionHash(paymentResult.transactionHash);
        setDepositPaid(true);
        alert('Deposit paid successfully! Your EMI plan is now active.');
      } else {
        throw new Error(paymentResult.error || 'Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to pay deposit:', error);
      alert(error.message || 'Failed to pay deposit. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-black mb-2">EMI Plan Created!</h1>
        <p className="text-gray-600">
          Your installment plan has been set up successfully. Pay your deposit to activate it.
        </p>
      </div>

      {/* Plan Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-black mb-4">Plan Summary</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Purchase Amount</span>
            <span className="font-bold text-black">${orderData.total.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-gray-700">Security Deposit</span>
            <span className="font-bold text-blue-600">${plan.deposit.amount.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Monthly Payment</span>
            <span className="font-bold text-black">
              ${((plan.plan.totalAmount - plan.deposit.amount) / plan.plan.term).toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Payment Term</span>
            <span className="font-bold text-black">{plan.plan.term} months</span>
          </div>
        </div>
      </div>

      {/* Payment Schedule Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-black mb-4">Payment Schedule</h2>
        
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {plan.schedule.slice(0, 3).map((installment: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-medium text-black">Payment #{installment.installmentNumber}</div>
                  <div className="text-sm text-gray-600">
                    Due: {formatDate(installment.dueDate)}
                  </div>
                </div>
              </div>
              <div className="font-bold text-black flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>{installment.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
          
          {plan.schedule.length > 3 && (
            <div className="text-center text-gray-500 text-sm">
              +{plan.schedule.length - 3} more payments
            </div>
          )}
        </div>
      </div>

      {/* Deposit Payment */}
      {!depositPaid ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-black mb-4">Pay Security Deposit</h2>
          <p className="text-gray-600 mb-6">
            Pay your security deposit of ${plan.deposit.amount.toFixed(2)} to activate your EMI plan. 
            This deposit will be returned when you complete all payments.
          </p>
          
          <button
            onClick={handlePayDeposit}
            disabled={isProcessing}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay Deposit - ${plan.deposit.amount.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Deposit Paid Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your EMI plan is now active. Your first payment is due on{' '}
              {formatDate(plan.schedule[0].dueDate)}.
            </p>
            
            {transactionHash && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <div className="text-sm text-gray-600">Transaction Hash:</div>
                <code className="text-xs text-black font-mono break-all">
                  {transactionHash}
                </code>
              </div>
            )}
            
            <button
              onClick={onBackHome}
              className="bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6">
        <h3 className="font-bold text-black mb-3">Important Information</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Your first EMI payment is due 30 days from today</li>
          <li>• Payments will be automatically deducted from your wallet</li>
          <li>• Ensure sufficient PYUSD balance before each due date</li>
          <li>• Late payments may incur additional fees</li>
          <li>• You can make early payments to reduce interest</li>
        </ul>
      </div>
    </div>
  );
};

export default Confirmation;