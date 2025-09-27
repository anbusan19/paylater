import React, { useState } from 'react';
import PaymentFlow from './PaymentFlow';
import { ShoppingCart, Package, Smartphone, Headphones } from 'lucide-react';

const PaymentDemo: React.FC = () => {
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Sample order data
  const sampleOrders = [
    {
      orderId: 'ORD-2024-001',
      vendor: 'TechStore Pro',
      items: [
        { name: 'Wireless Headphones', price: 299.99, quantity: 1 },
        { name: 'Phone Case', price: 24.99, quantity: 2 }
      ],
      total: 349.97
    },
    {
      orderId: 'ORD-2024-002',
      vendor: 'Fashion Hub',
      items: [
        { name: 'Designer Jacket', price: 189.99, quantity: 1 },
        { name: 'Sneakers', price: 129.99, quantity: 1 }
      ],
      total: 319.98
    },
    {
      orderId: 'ORD-2024-003',
      vendor: 'Home & Garden',
      items: [
        { name: 'Smart Home Kit', price: 499.99, quantity: 1 },
        { name: 'LED Bulbs (4-pack)', price: 39.99, quantity: 1 }
      ],
      total: 539.98
    }
  ];

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    setShowPaymentFlow(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentFlow(false);
    setSelectedOrder(null);
  };

  const getOrderIcon = (index: number) => {
    const icons = [Headphones, Package, Smartphone];
    const Icon = icons[index] || ShoppingCart;
    return <Icon className="w-6 h-6" />;
  };

  if (showPaymentFlow && selectedOrder) {
    return (
      <PaymentFlow
        orderData={selectedOrder}
        onComplete={handlePaymentComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">PayLater Demo</h1>
            <p className="text-gray-600">
              Experience seamless PYUSD payments with instant or EMI options
            </p>
          </div>
        </div>

        {/* Sample Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-black mb-4">Select an Order to Pay</h2>
          
          <div className="space-y-4">
            {sampleOrders.map((order, index) => (
              <button
                key={order.orderId}
                onClick={() => handleOrderSelect(order)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-black transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    {getOrderIcon(index)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-black mb-1">{order.vendor}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">#{order.orderId}</span>
                      <span className="font-bold text-black">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-medium text-black mb-4">Payment Features</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Instant PYUSD payments</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Flexible EMI options (3, 6, 12 months)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Wallet-based verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Immediate vendor payments</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-600 text-center">
            This is a demo showcasing PayLater's payment flow. 
            All transactions are simulated for demonstration purposes.
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Powered by PayLater • Built with React & Tailwind CSS
        </p>
      </div>
    </div>
  );
};

export default PaymentDemo;