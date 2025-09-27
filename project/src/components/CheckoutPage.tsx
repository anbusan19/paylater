import React from 'react';
import { CreditCard, Calendar } from 'lucide-react';

interface OrderData {
  items: Array<{
    name: string;
    price: number;
  }>;
  total: number;
}

interface CheckoutPageProps {
  orderData: OrderData;
  onPayNow: () => void;
  onEMISelect: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ orderData, onPayNow, onEMISelect }) => {
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

      {/* Bill Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative z-10">
        <h2 className="text-xl font-bold text-black mb-4">Order Summary</h2>
        
        <div className="space-y-3 mb-4">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-700">{item.name}</span>
              <span className="font-medium text-black">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-black">Total</span>
            <span className="text-xl font-bold text-black">${orderData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        <button
          onClick={onPayNow}
          className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          <span>Pay Now</span>
        </button>

        <button
          onClick={onEMISelect}
          className="w-full bg-white text-black py-4 px-6 rounded-2xl font-medium border-2 border-black flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors"
        >
          <Calendar className="w-5 h-5" />
          <span>Pay with EMI</span>
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        Secure payments powered by PayLater
      </p>
    </div>
  );
};

export default CheckoutPage;