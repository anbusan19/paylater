import React, { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface WalletVerificationProps {
  walletData: any;
  onVerified: () => void;
}

const WalletVerification: React.FC<WalletVerificationProps> = ({ walletData, onVerified }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationScore, setVerificationScore] = useState<number | null>(null);

  // Mock microdeposit amount
  const expectedDeposit = 0.37;

  const handleVerify = async () => {
    setIsVerifying(true);
    
    // Mock verification delay
    setTimeout(() => {
      const isCorrect = parseFloat(depositAmount) === expectedDeposit;
      const score = isCorrect ? 95 : 0;
      setVerificationScore(score);
      setIsVerifying(false);
      
      if (isCorrect) {
        setTimeout(() => {
          onVerified();
        }, 2000);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-black mx-auto mb-4" />
        <h2 className="text-xl font-bold text-black mb-2">Verify Your Wallet</h2>
        <p className="text-gray-600">Complete identity verification for EMI eligibility</p>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-medium text-black mb-2">Wallet Details</h3>
        <p className="text-sm text-gray-600 mb-1">Address: {walletData?.address?.slice(0, 20)}...</p>
        <p className="text-sm text-gray-600">Type: {walletData?.type}</p>
      </div>

      {verificationScore === null ? (
        <div>
          <div className="mb-6">
            <h3 className="font-medium text-black mb-3">Microdeposit Verification</h3>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a small deposit to your wallet. Enter the exact amount to verify ownership.
            </p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={!depositAmount || isVerifying}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify Amount'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          {verificationScore > 0 ? (
            <div>
              <CheckCircle className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-2">Verification Complete!</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-black mb-2">{verificationScore}%</div>
                <p className="text-sm text-gray-600">Verification Score</p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Your identity has been successfully verified. You're eligible for EMI plans.
              </p>
            </div>
          ) : (
            <div>
              <div className="text-red-500 mb-4">
                <div className="text-3xl font-bold mb-2">{verificationScore}%</div>
                <p className="text-sm">Verification Failed</p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                The amount entered doesn't match our records. Please try again.
              </p>
              <button
                onClick={() => {
                  setVerificationScore(null);
                  setDepositAmount('');
                }}
                className="bg-black text-white py-2 px-4 rounded-xl text-sm hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletVerification;