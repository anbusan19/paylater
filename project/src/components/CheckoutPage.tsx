import React from 'react';
import { CreditCard, Calendar, ArrowRight, Shield } from 'lucide-react';

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

interface CheckoutPageProps {
  orderData: OrderData;
  onPayNow: () => void;
  onEMISelect: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ orderData, onPayNow, onEMISelect }) => {
  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-black mb-4">Order Summary</h2>
        <div className="space-y-3">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-black">{item.name}</div>
                {item.quantity && (
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                )}
              </div>
              <div className="font-bold text-black">${item.price.toFixed(2)}</div>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-black">Total</div>
              <div className="font-bold text-black text-xl">${orderData.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <div>Vendor: {orderData.vendor}</div>
            <div>Order ID: {orderData.orderId}</div>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-black mb-6">Choose Payment Method</h2>
        
        <div className="space-y-4">
          {/* Pay Now Option */}
          <button
            onClick={onPayNow}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-black transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black">Pay Now</h3>
                  <p className="text-gray-600">Complete payment immediately</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-black text-xl">${orderData.total.toFixed(2)}</div>
                <div className="text-sm text-gray-600">One-time payment</div>
              </div>
            </div>
          </button>

          {/* EMI Option */}
          <button
            onClick={onEMISelect}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-black transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black">Pay with EMI</h3>
                  <p className="text-gray-600">Split into flexible monthly payments</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600 text-xl">
                  From ${(orderData.total / 12).toFixed(2)}/mo
                </div>
                <div className="text-sm text-gray-600">3, 6, or 12 months</div>
              </div>
            </div>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-green-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-black">Secure Payment</h4>
              <p className="text-sm text-gray-600">
                Your payment is protected by enterprise-grade security and processed on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;