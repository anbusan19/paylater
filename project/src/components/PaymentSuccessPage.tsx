import React from 'react';
import { CheckCircle, Copy, ExternalLink, Calendar, CreditCard, Download, Share2 } from 'lucide-react';

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

interface PaymentSuccessPageProps {
  orderData: OrderData;
  paymentType: 'instant' | 'emi';
  transactionHash?: string;
  emiPlan?: EMIPlan;
  walletAddress?: string;
  onNewPayment: () => void;
  onViewDashboard?: () => void;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({
  orderData,
  paymentType,
  transactionHash,
  emiPlan,
  walletAddress,
  onNewPayment,
  onViewDashboard
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const generateNextPaymentDate = (monthsFromNow: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 py-6">
      {/* Success Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">
            {paymentType === 'instant' ? 'Payment Successful!' : 'EMI Setup Complete!'}
          </h2>
          <p className="text-gray-600">
            {paymentType === 'instant' 
              ? 'Your payment has been processed successfully'
              : 'Your EMI plan is active and the vendor has been paid'
            }
          </p>
        </div>

        {/* Transaction Details */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-black mb-3">Transaction Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID</span>
              <span className="text-black font-mono">#{orderData.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vendor</span>
              <span className="text-black">{orderData.vendor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid</span>
              <span className="text-black font-medium">${orderData.total.toFixed(2)} PYUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="text-black">
                {paymentType === 'instant' ? 'Instant Payment' : `EMI (${emiPlan?.term} months)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="text-black">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Transaction Hash (for instant payments) */}
        {paymentType === 'instant' && transactionHash && (
          <div className="mb-6 p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
              <button
                onClick={() => copyToClipboard(transactionHash)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <code className="text-sm text-black font-mono break-all">{transactionHash}</code>
            <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
              <ExternalLink className="w-4 h-4" />
              <span>View on Explorer</span>
            </button>
          </div>
        )}

        {/* EMI Plan Details */}
        {paymentType === 'emi' && emiPlan && (
          <div className="mb-6 p-4 border border-gray-200 rounded-xl">
            <h3 className="font-medium text-black mb-3">Your EMI Plan</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment</span>
                <span className="text-black font-medium">${emiPlan.monthlyAmount.toFixed(2)} PYUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-black">${emiPlan.totalAmount.toFixed(2)} PYUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate</span>
                <span className="text-black">{(emiPlan.interestRate * 100).toFixed(1)}% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Payment</span>
                <span className="text-black">{generateNextPaymentDate(1)}</span>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Payment Schedule</span>
              </div>
              <p className="text-sm text-blue-700">
                Automatic monthly deductions will start on {generateNextPaymentDate(1)}
              </p>
            </div>
          </div>
        )}

        {/* Wallet Information */}
        {walletAddress && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Wallet</span>
              <button
                onClick={() => copyToClipboard(walletAddress)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <code className="text-sm text-black font-mono">{formatAddress(walletAddress)}</code>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {paymentType === 'emi' && onViewDashboard && (
          <button
            onClick={onViewDashboard}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>View EMI Dashboard</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {/* Download receipt logic */}}
            className="bg-white text-black py-3 px-6 rounded-xl font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Receipt</span>
          </button>

          <button
            onClick={() => {/* Share logic */}}
            className="bg-white text-black py-3 px-6 rounded-xl font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        <button
          onClick={onNewPayment}
          className="w-full bg-white text-black py-3 px-6 rounded-xl font-medium border-2 border-black hover:bg-gray-50 transition-colors"
        >
          Make Another Payment
        </button>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-black mb-2">What's Next?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {paymentType === 'instant' ? (
            <>
              <li>• Your payment has been confirmed on the blockchain</li>
              <li>• The vendor will process your order shortly</li>
              <li>• You'll receive order updates via email</li>
            </>
          ) : (
            <>
              <li>• The vendor has received the full payment amount</li>
              <li>• Your first EMI payment is due on {generateNextPaymentDate(1)}</li>
              <li>• Ensure sufficient PYUSD balance for automatic deductions</li>
              <li>• You can prepay or view your schedule anytime</li>
            </>
          )}
        </ul>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Thank you for using PayLater • Secure • Transparent • Global
      </p>
    </div>
  );
};

export default PaymentSuccessPage;