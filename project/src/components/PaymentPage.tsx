import React, { useState } from 'react';
import { CreditCard, Calendar, DollarSign, Shield, Clock } from 'lucide-react';

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

interface PaymentPageProps {
  orderData: OrderData;
  onInstantPayment: () => void;
  onEMIPayment: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ 
  orderData, 
  onInstantPayment, 
  onEMIPayment 
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'instant' | 'emi' | null>(null);

  const handlePaymentMethodSelect = (method: 'instant' | 'emi') => {
    setSelectedPaymentMethod(method);
  };

  const handleProceed = () => {
    if (selectedPaymentMethod === 'instant') {
      onInstantPayment();
    } else if (selectedPaymentMethod === 'emi') {
      onEMIPayment();
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Decorative Pattern */}
      <div className="relative">
        <div className="absolute top-0 left-4 w-32 h-32 opacity-10">
          <div className="w-full h-full bg-black rounded-full transform -translate-x-1/2"></div>
        </div>
        <div className="absolute top-8 right-8 w-24 h-24 opacity-5">
          <div 
            className="w-full h-full bg-black"
            style={{
              backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)',
              backgroundSize: '8px 8px'
            }}
          ></div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">Order Summary</h2>
          <span className="text-sm text-gray-500">#{orderData.orderId}</span>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Vendor: {orderData.vendor}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <span className="text-gray-700">{item.name}</span>
                {item.quantity && (
                  <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                )}
              </div>
              <span className="font-medium text-black">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-black">Total Amount</span>
            <span className="text-xl font-bold text-black">${orderData.total.toFixed(2)} PYUSD</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-black mb-4">Choose Payment Method</h3>
        
        <div className="space-y-4 mb-6">
          {/* Instant Payment Option */}
          <button
            onClick={() => handlePaymentMethodSelect('instant')}
            className={`w-full p-4 text-left border-2 rounded-xl transition-colors ${
              selectedPaymentMethod === 'instant'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-black text-white rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-black mb-1">Pay Now</h4>
                <p className="text-sm text-gray-600">Instant payment with PYUSD</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Instant settlement</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">No additional fees</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-black">${orderData.total.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Pay today</div>
              </div>
            </div>
          </button>

          {/* EMI Payment Option */}
          <button
            onClick={() => handlePaymentMethodSelect('emi')}
            className={`w-full p-4 text-left border-2 rounded-xl transition-colors ${
              selectedPaymentMethod === 'emi'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white border-2 border-black rounded-xl">
                <Calendar className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-black mb-1">Pay with EMI</h4>
                <p className="text-sm text-gray-600">Split into monthly installments</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-purple-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs">Wallet verification required</span>
                  </div>
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">3, 6, or 12 months</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-black">From ${(orderData.total / 12).toFixed(2)}</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>
          </button>
        </div>

        {selectedPaymentMethod && (
          <div className="p-4 bg-gray-50 rounded-xl mb-4">
            <h5 className="font-medium text-black mb-2">
              {selectedPaymentMethod === 'instant' ? 'Instant Payment' : 'EMI Payment'} Selected
            </h5>
            <p className="text-sm text-gray-600">
              {selectedPaymentMethod === 'instant' 
                ? 'Your payment will be processed immediately using PYUSD. The vendor will receive the full amount instantly.'
                : 'You will be able to choose from 3, 6, or 12-month payment plans. Wallet verification is required for EMI eligibility.'
              }
            </p>
          </div>
        )}

        <button
          onClick={handleProceed}
          disabled={!selectedPaymentMethod}
          className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedPaymentMethod === 'instant' ? 'Proceed to Payment' : 'Continue to EMI Setup'}
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Secure Payment</span>
        </div>
        <p className="text-sm text-gray-600">
          All payments are secured by blockchain technology and processed using PYUSD stablecoin. 
          Your transaction data is encrypted and protected.
        </p>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Powered by PayLater • Secure • Transparent • Global
      </p>
    </div>
  );
};

export default PaymentPage;