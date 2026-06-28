import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Clock, MapPin, Package, AlertCircle } from 'lucide-react';
import { Order } from '../types';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort in memory to avoid composite index requirement
      fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.warn('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 text-center"><p>Loading your orders...</p></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-800">No Orders Yet</h2>
        <p className="text-sm text-gray-500 mt-2">Looks like you haven't placed any orders. Start exploring our menu!</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'on_way': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_way': return 'out for delivery';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm font-bold text-gray-600">#{order.id.slice(0, 8).toUpperCase()}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {new Date(order.createdAt).toLocaleString()}
              </div>
              
              <div className="space-y-1 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} x{item.quantity}</span>
                    <span className="text-gray-500">LKR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {order.additionalFee && order.additionalFee > 0 ? (
                  <div className="flex justify-between text-sm text-amber-700 bg-amber-50 p-1.5 rounded mt-2">
                    <span className="font-medium">{order.additionalFeeReason || "Additional Fee"}</span>
                    <span className="font-medium">LKR {order.additionalFee.toFixed(2)}</span>
                  </div>
                ) : null}
              </div>

              {order.specialInstructions && (
                <div className="mb-4 text-xs bg-yellow-50 text-yellow-800 p-2 rounded-lg border border-yellow-200">
                  <span className="font-bold block mb-0.5">Special Instructions:</span>
                  {order.specialInstructions}
                </div>
              )}
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-50 font-bold mb-3">
                <span className="text-gray-800">Total</span>
                <span className="text-amber-700">LKR {order.totalAmount.toFixed(2)}</span>
              </div>
              
              {order.deliveryGuyNumber && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50 text-sm">
                  <span className="font-medium text-gray-700">Delivery Guy Number:</span>
                  <a href={`tel:${order.deliveryGuyNumber}`} className="text-amber-600 font-bold hover:underline">
                    {order.deliveryGuyNumber}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
