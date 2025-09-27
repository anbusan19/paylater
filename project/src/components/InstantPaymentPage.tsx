import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { PaymentService } from '../utils/paymentService';

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

interface InstantPaymentPageProps {
  orderData: OrderData;
  onPaymentSuccess: (transactionHash: string) => void;
  onPaymentFailed: (error: string) => void;
  onBack: () => void;
}

const InstantPaymentPage: React.FC<InstantPaymentPageProps> = ({
  orderData,
  onPaymentSuccess,
  onPaymentFailed,
  onBack
}) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [pyusdBalance, setPyusdBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'connect' | 'confirm' | 'processing'>('connect');

  // Real wallet connection
  const connectWallet = async () => {
    setIsProcessing(true);
    
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
        setIsProcessing(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        
        // Verify PYUSD contract first
        const contractCheck = await PaymentService.verifyPYUSDContract();
        if (!contractCheck.isValid) {
          alert(`PYUSD contract verification failed: ${contractCheck.error}`);
        }
        
        // Get real PYUSD balance
        const balance = await PaymentService.getPYUSDBalance(address);
        setPyusdBalance(balance);
        
        console.log(`Wallet: ${address}`);
        console.log(`PYUSD Balance: ${balance}`);
        
        setWalletConnected(true);
        setStep('confirm');
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async () => {
    setStep('processing');
    setIsProcessing(true);

    try {
      // Check balance first
      const hasBalance = await PaymentService.checkSufficientBalance(walletAddress, orderData.total);
      if (!hasBalance) {
        onPaymentFailed('Insufficient PYUSD balance');
        return;
      }

      // Process the actual payment
      const result = await PaymentService.processInstantPayment(walletAddress, orderData.total);
      
      if (result.success && result.transactionHash) {
        onPaymentSuccess(result.transactionHash);
      } else {
        onPaymentFailed(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      onPaymentFailed(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (step === 'connect') {
    return (
      <div className="space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <Wallet className="w-12 h-12 text-black mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">Connect your wallet to pay with PYUSD</p>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Order Total</span>
              <span className="font-bold text-black">${orderData.total.toFixed(2)} PYUSD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Vendor</span>
              <span className="text-sm text-gray-700">{orderData.vendor}</span>
            </div>
          </div>

          <button
            onClick={connectWallet}
            disabled={isProcessing}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>

          <button
            onClick={onBack}
            className="w-full mt-3 bg-white text-black py-3 px-6 rounded-xl font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back to Payment Options
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    const hasInsufficientBalance = pyusdBalance < orderData.total;

    return (
      <div className="space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <CreditCard className="w-12 h-12 text-black mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Confirm Payment</h2>
            <p className="text-gray-600">Review your payment details</p>
          </div>

          {/* Wallet Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Connected Wallet</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <code className="text-sm text-black font-mono">{formatAddress(walletAddress)}</code>
              <button
                onClick={() => copyToClipboard(walletAddress)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">PYUSD Balance</span>
              <span className={`text-sm font-medium ${hasInsufficientBalance ? 'text-red-600' : 'text-green-600'}`}>
                ${pyusdBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6 p-4 border border-gray-200 rounded-xl">
            <h3 className="font-medium text-black mb-3">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="text-black">${orderData.total.toFixed(2)} PYUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Network Fee</span>
                <span className="text-black">~$0.02 PYUSD</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-black">Total</span>
                  <span className="font-bold text-black">${(orderData.total + 0.02).toFixed(2)} PYUSD</span>
                </div>
              </div>
            </div>
          </div>

          {hasInsufficientBalance && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-700">Insufficient Balance</span>
              </div>
              <p className="text-sm text-red-600">
                You need ${(orderData.total - pyusdBalance + 0.02).toFixed(2)} more PYUSD to complete this payment.
              </p>
            </div>
          )}

          <button
            onClick={processPayment}
            disabled={hasInsufficientBalance}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasInsufficientBalance ? 'Insufficient Balance' : 'Confirm Payment'}
          </button>

          <button
            onClick={() => setStep('connect')}
            className="w-full mt-3 bg-white text-black py-3 px-6 rounded-xl font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Change Wallet
          </button>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-black mb-2">Processing Payment</h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed on the blockchain. This may take a few moments.
            </p>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-black">${orderData.total.toFixed(2)} PYUSD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">To</span>
                <span className="text-sm text-black">{orderData.vendor}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Please do not close this window while the transaction is being processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstantPaymentPage;