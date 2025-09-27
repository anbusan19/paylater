import React, { useState } from 'react';
import { Calendar, Wallet, Shield, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';

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

interface EMIPaymentPageProps {
  orderData: OrderData;
  onEMISuccess: (plan: EMIPlan, walletAddress: string) => void;
  onEMIFailed: (error: string) => void;
  onBack: () => void;
}

const EMIPaymentPage: React.FC<EMIPaymentPageProps> = ({
  orderData,
  onEMISuccess,
  onEMIFailed,
  onBack
}) => {
  const [step, setStep] = useState<'connect' | 'verify' | 'select' | 'confirm' | 'processing'>('connect');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<EMIPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationScore, setVerificationScore] = useState(0);

  const calculateEMIPlans = (): EMIPlan[] => {
    const amount = orderData.total;
    
    const plans = [
      { term: 3, interestRate: 0.08 }, // 8% annual
      { term: 6, interestRate: 0.10 }, // 10% annual
      { term: 12, interestRate: 0.12 } // 12% annual
    ];

    return plans.map(plan => {
      const monthlyRate = plan.interestRate / 12;
      const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, plan.term)) / 
                            (Math.pow(1 + monthlyRate, plan.term) - 1);
      
      return {
        id: `${plan.term}months`,
        term: plan.term,
        monthlyAmount: monthlyPayment,
        totalAmount: monthlyPayment * plan.term,
        interestRate: plan.interestRate,
        label: `${plan.term} Months`
      };
    });
  };

  const emiPlans = calculateEMIPlans();

  const connectWallet = async () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const mockAddress = '0x742d35Cc434C1234567890abcdef1234567890ab';
      setWalletAddress(mockAddress);
      setWalletConnected(true);
      setStep('verify');
      setIsProcessing(false);
    }, 2000);
  };

  const verifyEligibility = async () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      // Mock verification process
      const score = Math.floor(Math.random() * 40) + 60; // Score between 60-100
      setVerificationScore(score);
      setIsEligible(score >= 70);
      setStep('select');
      setIsProcessing(false);
    }, 3000);
  };

  const confirmEMI = async () => {
    if (!selectedPlan) return;
    
    setStep('processing');
    setIsProcessing(true);

    setTimeout(() => {
      if (isEligible && selectedPlan) {
        onEMISuccess(selectedPlan, walletAddress);
      } else {
        onEMIFailed('EMI setup failed');
      }
      setIsProcessing(false);
    }, 3000);
  };

  if (step === 'connect') {
    return (
      <div className="space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <Wallet className="w-12 h-12 text-black mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Connect Wallet for EMI</h2>
            <p className="text-gray-600">Connect your wallet to verify EMI eligibility</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-medium text-blue-800 mb-2">EMI Requirements</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Wallet verification for identity</li>
              <li>• Transaction history analysis</li>
              <li>• Minimum eligibility score of 70</li>
              <li>• Automatic monthly PYUSD deductions</li>
            </ul>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Purchase Amount</span>
              <span className="font-bold text-black">${orderData.total.toFixed(2)} PYUSD</span>
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

  if (step === 'verify') {
    return (
      <div className="space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-black mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Verify EMI Eligibility</h2>
            <p className="text-gray-600">Analyzing your wallet for EMI qualification</p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Connected Wallet</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <code className="text-sm text-black font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</code>
          </div>

          {!isProcessing ? (
            <div className="mb-6">
              <h3 className="font-medium text-black mb-3">Verification Process</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Transaction history analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Wallet balance verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Credit score calculation</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your eligibility...</p>
            </div>
          )}

          <button
            onClick={verifyEligibility}
            disabled={isProcessing}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Verifying...' : 'Start Verification'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <Calendar className="w-12 h-12 text-black mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Choose Your EMI Plan</h2>
            <p className="text-gray-600">Select a payment plan that works for you</p>
          </div>

          {/* Eligibility Status */}
          <div className={`mb-6 p-4 rounded-xl ${isEligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              {isEligible ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-medium ${isEligible ? 'text-green-700' : 'text-red-700'}`}>
                {isEligible ? 'EMI Approved' : 'EMI Not Approved'}
              </span>
            </div>
            <p className={`text-sm ${isEligible ? 'text-green-600' : 'text-red-600'}`}>
              {isEligible 
                ? `Verification Score: ${verificationScore}/100. You are eligible for EMI payments.`
                : `Verification Score: ${verificationScore}/100. Minimum score of 70 required for EMI.`
              }
            </p>
          </div>

          {isEligible ? (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Purchase Amount</span>
                  <span className="font-bold text-black">${orderData.total.toFixed(2)} PYUSD</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {emiPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-colors ${
                      selectedPlan?.id === plan.id
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
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{plan.term} monthly payments</span>
                      <span>Total: ${plan.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Interest: {(plan.interestRate * 100).toFixed(1)}% per annum
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('confirm')}
                disabled={!selectedPlan}
                className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Continue with Selected Plan
              </button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Unfortunately, you don't meet the minimum requirements for EMI payments at this time.
              </p>
              <button
                onClick={onBack}
                className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Back to Payment Options
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'confirm' && selectedPlan) {
    return (
      <div className="space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Confirm EMI Setup</h2>
            <p className="text-gray-600">Review your EMI plan details</p>
          </div>

          {/* EMI Plan Summary */}
          <div className="mb-6 p-4 border border-gray-200 rounded-xl">
            <h3 className="font-medium text-black mb-3">EMI Plan Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Amount</span>
                <span className="text-black">${orderData.total.toFixed(2)} PYUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EMI Term</span>
                <span className="text-black">{selectedPlan.term} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment</span>
                <span className="text-black">${selectedPlan.monthlyAmount.toFixed(2)} PYUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate</span>
                <span className="text-black">{(selectedPlan.interestRate * 100).toFixed(1)}% p.a.</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-black">Total Amount</span>
                  <span className="font-bold text-black">${selectedPlan.totalAmount.toFixed(2)} PYUSD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-black mb-3">Payment Schedule</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">First payment: Today (vendor receives full amount)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  Monthly payments: ${selectedPlan.monthlyAmount.toFixed(2)} for {selectedPlan.term} months
                </span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h4 className="font-medium text-yellow-800 mb-2">Important Notice</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Monthly payments will be automatically deducted from your wallet</li>
              <li>• Ensure sufficient PYUSD balance for each payment date</li>
              <li>• Late payments may incur additional fees</li>
              <li>• You can prepay the remaining amount at any time</li>
            </ul>
          </div>

          <button
            onClick={confirmEMI}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Confirm EMI Setup
          </button>

          <button
            onClick={() => setStep('select')}
            className="w-full mt-3 bg-white text-black py-3 px-6 rounded-xl font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Change Plan
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
            <h2 className="text-xl font-bold text-black mb-2">Setting Up EMI</h2>
            <p className="text-gray-600 mb-6">
              Creating your EMI plan and processing vendor payment...
            </p>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Vendor Payment</span>
                <span className="font-medium text-black">${orderData.total.toFixed(2)} PYUSD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Your EMI Plan</span>
                <span className="text-sm text-black">
                  {selectedPlan?.monthlyAmount.toFixed(2)} × {selectedPlan?.term} months
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Please wait while we set up your EMI plan and pay the vendor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EMIPaymentPage;