import React, { useState } from 'react';
import { Wallet, Copy, Eye, EyeOff } from 'lucide-react';

interface WalletCreationProps {
  onWalletCreated: (data: any) => void;
}

const WalletCreation: React.FC<WalletCreationProps> = ({ onWalletCreated }) => {
  const [walletType, setWalletType] = useState<'custodial' | 'non-custodial' | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [walletCreated, setWalletCreated] = useState(false);

  // Mock wallet data
  const mockWallet = {
    address: '0x742d35Cc434C1234567890abcdef1234567890ab',
    mnemonic: 'abandon ability able about above absent absorb abstract absurd abuse access accident'
  };

  const handleCreateWallet = async () => {
    setIsCreating(true);
    
    // Mock wallet creation delay
    setTimeout(() => {
      setIsCreating(false);
      setWalletCreated(true);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleContinue = () => {
    onWalletCreated({
      type: walletType,
      ...mockWallet
    });
  };

  if (walletCreated) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <Wallet className="w-12 h-12 text-black mx-auto mb-4" />
          <h2 className="text-xl font-bold text-black mb-2">Wallet Created Successfully</h2>
          <p className="text-gray-600">Your {walletType} wallet has been created</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <code className="flex-1 text-sm text-black font-mono break-all">{mockWallet.address}</code>
              <button
                onClick={() => copyToClipboard(mockWallet.address)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {walletType === 'non-custodial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recovery Phrase</label>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Keep this safe and secure</span>
                  <button
                    onClick={() => setShowMnemonic(!showMnemonic)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {showMnemonic ? (
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-sm text-black font-mono">{mockWallet.mnemonic}</code>
                    <button
                      onClick={() => copyToClipboard(mockWallet.mnemonic)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">••• ••• ••• ••• ••• ••• ••• •••</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <Wallet className="w-12 h-12 text-black mx-auto mb-4" />
        <h2 className="text-xl font-bold text-black mb-2">Create Your Wallet</h2>
        <p className="text-gray-600">Choose your preferred wallet type to get started</p>
      </div>

      {!walletType ? (
        <div className="space-y-4">
          <button
            onClick={() => setWalletType('custodial')}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-black transition-colors"
          >
            <h3 className="font-medium text-black mb-1">Custodial Wallet</h3>
            <p className="text-sm text-gray-600">We manage your wallet securely</p>
          </button>
          
          <button
            onClick={() => setWalletType('non-custodial')}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-black transition-colors"
          >
            <h3 className="font-medium text-black mb-1">Non-Custodial Wallet</h3>
            <p className="text-sm text-gray-600">You have full control of your wallet</p>
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-black mb-2">Selected: {walletType} wallet</h3>
            <p className="text-sm text-gray-600">
              {walletType === 'custodial' 
                ? 'Your wallet will be managed securely by PayLater'
                : 'You will receive a recovery phrase to secure your wallet'
              }
            </p>
          </div>

          <button
            onClick={handleCreateWallet}
            disabled={isCreating}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating Wallet...' : 'Create Wallet'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletCreation;