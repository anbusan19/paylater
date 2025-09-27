import React, { useState } from 'react';
import { PaymentService } from '../utils/paymentService';
import { CONTRACT_CONFIG } from '../utils/contractConfig';

const DebugPanel: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);

  const connectAndCheck = async () => {
    setIsLoading(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask not found');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);

        // Check contract
        const contractCheck = await PaymentService.verifyPYUSDContract();
        setContractInfo(contractCheck);

        // Get balance
        const pyusdBalance = await PaymentService.getPYUSDBalance(address);
        setBalance(pyusdBalance);
      }
    } catch (error) {
      console.error('Debug check failed:', error);
      alert(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSpecificAddress = async () => {
    if (!walletAddress) {
      alert('Please enter a wallet address');
      return;
    }

    setIsLoading(true);
    try {
      const pyusdBalance = await PaymentService.getPYUSDBalance(walletAddress);
      setBalance(pyusdBalance);
    } catch (error) {
      console.error('Balance check failed:', error);
      alert(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 m-4">
      <h2 className="text-xl font-bold text-black mb-4">PYUSD Debug Panel</h2>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PYUSD Contract Address
            </label>
            <code className="block p-2 bg-gray-100 rounded text-sm break-all">
              {CONTRACT_CONFIG.PYUSD_CONTRACT_ADDRESS}
            </code>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merchant Wallet Address
            </label>
            <code className="block p-2 bg-gray-100 rounded text-sm break-all">
              {CONTRACT_CONFIG.MERCHANT_WALLET_ADDRESS || 'NOT CONFIGURED'}
            </code>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Liquidity Pool Address
            </label>
            <code className="block p-2 bg-gray-100 rounded text-sm break-all">
              {CONTRACT_CONFIG.LIQUIDITY_WALLET_ADDRESS || 'NOT CONFIGURED'}
            </code>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter wallet address or connect MetaMask"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={connectAndCheck}
            disabled={isLoading}
            className="bg-black text-white py-2 px-4 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Connect & Check'}
          </button>
          
          <button
            onClick={checkSpecificAddress}
            disabled={isLoading || !walletAddress}
            className="bg-gray-600 text-white py-2 px-4 rounded font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            Check Address
          </button>
        </div>

        {contractInfo && (
          <div className="p-3 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Contract Status</h3>
            <p className={contractInfo.isValid ? 'text-green-600' : 'text-red-600'}>
              {contractInfo.isValid ? '✅ Contract accessible' : `❌ ${contractInfo.error}`}
            </p>
          </div>
        )}

        {balance !== null && (
          <div className="p-3 bg-blue-50 rounded">
            <h3 className="font-medium mb-2">PYUSD Balance</h3>
            <p className="text-lg font-bold">
              {balance} PYUSD
            </p>
            {balance === 0 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Balance is 0. Check if the contract address is correct or if you have PYUSD in this wallet.
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Expected: 200 PYUSD</p>
          <p>If balance shows 0, check:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Contract address is correct</li>
            <li>You're on the right network (Sepolia)</li>
            <li>Wallet actually contains PYUSD tokens</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;