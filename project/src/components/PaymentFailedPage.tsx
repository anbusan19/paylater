import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, HelpCircle, ExternalLink } from 'lucide-react';

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

interface PaymentFailedPageProps {
  orderData: OrderData;
  paymentType: 'instant' | 'emi';
  error: string;
  onRetry: () => void;
  onBack: () => void;
  onContactSupport?: () => void;
}

const PaymentFailedPage: React.FC<PaymentFailedPageProps> = ({
  orderData,
  paymentType,
  error,
  onRetry,
  onBack,
  onContactSupport
}) => {
  const getErrorDetails = (errorMessage: string) => {
    const errorMap: { [key: string]: { title: string; description: string; suggestions: string[] } } = {
      'Insufficient PYUSD balance': {
        title: 'Insufficient Balance',
        description: 'Your wallet doesn\'t have enough PYUSD to complete this payment.',
        suggestions: [
          'Add more PYUSD to your wallet',
          'Try a different payment method',
          'Consider using EMI if available'
        ]
      },
      'Transaction failed': {
        title: 'Transaction Failed',
        description: 'The blockchain transaction could not be processed.',
        suggestions: [
          'Check your network connection',
          'Ensure your wallet is connected',
          'Try again in a few minutes'
        ]
      },
      'EMI setup failed': {
        title: 'EMI Setup Failed',
        description: 'There was an issue setting up your EMI plan.',
        suggestions: [
          'Verify your wallet connection',
          'Check your eligibility score',
          'Try instant payment instead'
        ]
      },
      'Wallet connection failed': {
        title: 'Wallet Connection Failed',
        description: 'Unable to connect to your wallet.',
        suggestions: [
          'Refresh the page and try again',
          'Check if your wallet extension is installed',
          'Try a different wallet'
        ]
      },
      'Network error': {
        title: 'Network Error',
        description: 'There was a problem connecting to the blockchain network.',
        suggestions: [
          'Check your internet connection',
          'Try again in a few minutes',
          'Switch to a different network if available'
        ]
      }
    };

    return errorMap[errorMessage] || {
      title: 'Payment Failed',
      description: 'An unexpected error occurred during payment processing.',
      suggestions: [
        'Try the payment again',
        'Check your wallet connection',
        'Contact support if the issue persists'
      ]
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="space-y-6 py-6">
      {/* Error Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">{errorDetails.title}</h2>
          <p className="text-gray-600">{errorDetails.description}</p>
        </div>

        {/* Error Details */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-700">Error Details</span>
          </div>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <div className="text-sm text-red-600">
            <span className="font-medium">Payment Type:</span> {paymentType === 'instant' ? 'Instant Payment' : 'EMI Payment'}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-black mb-3">Order Summary</h3>
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
              <span className="text-gray-600">Amount</span>
              <span className="text-black font-medium">${orderData.total.toFixed(2)} PYUSD</span>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-medium text-blue-800 mb-2">Suggested Solutions</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {errorDetails.suggestions.map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={onRetry}
          className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>

        <button
          onClick={onBack}
          className="w-full bg-white text-black py-3 px-6 rounded-xl font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Payment Options</span>
        </button>

        {onContactSupport && (
          <button
            onClick={onContactSupport}
            className="w-full bg-white text-black py-3 px-6 rounded-xl font-medium border-2 border-black hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Contact Support</span>
          </button>
        )}
      </div>

      {/* Troubleshooting Tips */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-black mb-3">Troubleshooting Tips</h4>
        <div className="space-y-3">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">For Wallet Issues:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Make sure your wallet extension is unlocked</li>
              <li>• Check if you're connected to the correct network</li>
              <li>• Try refreshing the page and reconnecting</li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">For Balance Issues:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verify your PYUSD balance in your wallet</li>
              <li>• Account for network fees in your balance</li>
              <li>• Consider purchasing more PYUSD if needed</li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">For EMI Issues:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ensure your verification score meets requirements</li>
              <li>• Check that your wallet has transaction history</li>
              <li>• Try instant payment as an alternative</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-black mb-3">Need More Help?</h4>
        <div className="space-y-2">
          <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
            <ExternalLink className="w-4 h-4" />
            <span>View Payment FAQ</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
            <ExternalLink className="w-4 h-4" />
            <span>Check System Status</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
            <ExternalLink className="w-4 h-4" />
            <span>Contact Support Team</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        PayLater Support • Available 24/7 • support@paylater.com
      </p>
    </div>
  );
};

export default PaymentFailedPage;