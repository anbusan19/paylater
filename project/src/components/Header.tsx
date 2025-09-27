import React, { useState, useEffect } from 'react';
import { Wallet, Zap} from 'lucide-react';

interface HeaderProps {
  onWalletConnect?: (address: string) => void;
  onWalletDisconnect?: () => void;
  connectedWallet?: string;
  onViewProfile?: () => void;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Header: React.FC<HeaderProps> = ({ 
  onWalletConnect, 
  onWalletDisconnect, 
  connectedWallet,
  onViewProfile 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          onWalletConnect?.(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        onWalletConnect?.(accounts[0]);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        // User rejected the request
        alert('Please connect your wallet to continue.');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    onWalletDisconnect?.();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white border-b border-gray-100 p-4">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              
        {/* Logo */}
        <div className="text-xl font-bold text-black">
          PayLater
        </div>

        {/* Wallet Connection */}
        <div>
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-black text-white py-2 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={onViewProfile}
                className="bg-gray-100 py-2 px-3 rounded-xl flex items-center space-x-2 hover:bg-gray-200 transition-colors"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <code className="text-sm text-black font-mono">
                  {formatAddress(walletAddress)}
                </code>
              </button>
              <button
                onClick={disconnectWallet}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;