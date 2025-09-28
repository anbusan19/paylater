import {
    AlertTriangle,
    Award,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    History,
    TrendingUp,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PaymentService, TransactionHistory } from '../utils/paymentService';

interface EMIRecord {
  id: string;
  merchantName: string;
  totalAmount: number;
  monthlyAmount: number;
  remainingPayments: number;
  nextPaymentDate: Date;
  status: 'active' | 'completed' | 'overdue';
  depositAmount: number;
  startDate: Date;
  completionDate?: Date;
}

interface PaymentHistory {
  id: string;
  emiId: string;
  merchantName: string;
  amount: number;
  date: Date;
  type: 'deposit' | 'installment';
  status: 'completed' | 'failed';
  transactionHash?: string;
}

interface UserProfileData {
  address: string;
  creditScore: number;
  totalEMIs: number;
  activeEMIs: number;
  completedEMIs: number;
  totalAmountFinanced: number;
  onTimePaymentRate: number;
  joinDate: Date;
}

interface UserProfileProps {
  walletAddress: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ walletAddress }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'history'>('overview');
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [activeEMIs, setActiveEMIs] = useState<EMIRecord[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [walletAddress]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const profile = await PaymentService.getUserProfile(walletAddress);
      
      setProfileData({
        address: profile.address,
        creditScore: 0, // Not implemented yet
        totalEMIs: profile.activeEMIs + profile.completedEMIs,
        activeEMIs: profile.activeEMIs,
        completedEMIs: profile.completedEMIs,
        totalAmountFinanced: profile.totalAmountFinanced,
        onTimePaymentRate: 100, // Not implemented yet
        joinDate: new Date()
      });

      // Filter and format EMI transactions
      const emiTransactions = profile.transactions
        .filter((tx: TransactionHistory) => tx.type === 'emi')
        .map((tx: TransactionHistory) => ({
          id: tx.loanId || '',
          merchantName: tx.merchantName || `Merchant (${tx.merchantAddress.slice(0, 6)}...)`,
          totalAmount: tx.amount,
          monthlyAmount: tx.amount / 12, // Default to 12 months
          remainingPayments: 0, // Will be updated from contract
          nextPaymentDate: new Date(), // Will be updated from contract
          status: 'active' as 'active' | 'completed' | 'overdue',
          depositAmount: tx.amount * 0.2, // 20% deposit
          startDate: tx.date
        }));
        
      setActiveEMIs(emiTransactions);

      // Convert blockchain transactions to payment history
      setPaymentHistory(profile.transactions.map((tx: TransactionHistory, index: number) => ({
        id: `pay-${index}`,
        emiId: tx.loanId || `unknown-${index}`,
        merchantName: tx.merchantName || `Merchant (${tx.merchantAddress.slice(0, 6)}...)`,
        amount: tx.amount,
        date: tx.date,
        type: tx.type === 'emi' ? 'deposit' : 'installment',
        status: tx.status,
        transactionHash: tx.transactionHash
      })));

      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      // Show error state here if needed
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      case 'active':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Found</h3>
        <p className="text-gray-600">Connect your wallet to view your EMI profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">EMI Profile</h2>
            <p className="text-gray-600 font-mono text-sm">
              {profileData.address.slice(0, 6)}...{profileData.address.slice(-4)}
            </p>
          </div>
        </div>

        {/* Credit Score */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className={`text-3xl font-bold ${getCreditScoreColor(profileData.creditScore)}`}>
              {profileData.creditScore}
            </div>
            <div className="text-sm text-gray-600">Credit Score</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-black">{profileData.activeEMIs}</div>
            <div className="text-sm text-gray-600">Active EMIs</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-black">{profileData.completedEMIs}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-black">{profileData.onTimePaymentRate}%</div>
            <div className="text-sm text-gray-600">On-Time Rate</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Active EMIs
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            History
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Award className="w-6 h-6 text-blue-600" />
                    <h3 className="font-medium text-black">Financial Health</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Financed</span>
                      <span className="font-bold">${profileData.totalAmountFinanced.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Member Since</span>
                      <span className="font-bold">{formatDate(profileData.joinDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-medium text-black">Payment Performance</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Success Rate</span>
                      <span className="font-bold text-green-600">{profileData.onTimePaymentRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total EMIs</span>
                      <span className="font-bold">{profileData.totalEMIs}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active EMIs Tab */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeEMIs.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active EMIs</h3>
                  <p className="text-gray-600">You don't have any active EMI plans.</p>
                </div>
              ) : (
                activeEMIs.map((emi) => (
                  <div key={emi.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-black">{emi.merchantName}</h4>
                      <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(emi.status)}`}>
                        {emi.status.charAt(0).toUpperCase() + emi.status.slice(1)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Monthly Payment</span>
                        <div className="font-bold text-black">${emi.monthlyAmount.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Remaining</span>
                        <div className="font-bold text-black">{emi.remainingPayments} payments</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Next Payment</span>
                        <div className="font-bold text-black">{formatDate(emi.nextPaymentDate)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount</span>
                        <div className="font-bold text-black">${emi.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                  <p className="text-gray-600">Your payment history will appear here.</p>
                </div>
              ) : (
                paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="font-medium text-black">{payment.merchantName}</div>
                        <div className="text-sm text-gray-600">
                          {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} • {formatDate(payment.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-black flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{payment.amount.toFixed(2)}</span>
                      </div>
                      {payment.transactionHash && (
                        <div className="text-xs text-gray-500 font-mono">
                          {payment.transactionHash.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;