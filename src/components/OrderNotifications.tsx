import React, { useEffect, useRef, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { Order } from '../types';

export default function OrderNotifications() {
  const previousStatusMap = useRef<Record<string, string>>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const order = change.doc.data() as Order;
          const orderId = change.doc.id;
          const prevStatus = previousStatusMap.current[orderId];
          
          if (prevStatus && prevStatus !== order.status) {
            let message = '';
            let icon = 'ℹ️';
            
            switch (order.status) {
              case 'preparing':
                message = `Your order #${orderId.slice(0, 8).toUpperCase()} is now being prepared!`;
                icon = '🍳';
                break;
              case 'on_way':
                message = `Your order #${orderId.slice(0, 8).toUpperCase()} is out for delivery!`;
                icon = '🛵';
                break;
              case 'delivered':
                message = `Your order #${orderId.slice(0, 8).toUpperCase()} has been delivered. Enjoy!`;
                icon = '🎉';
                break;
              case 'cancelled':
                message = `Your order #${orderId.slice(0, 8).toUpperCase()} was cancelled.`;
                icon = '❌';
                break;
            }

            if (message) {
              toast(message, { icon, duration: 6000 });
            }
          }
          
          previousStatusMap.current[orderId] = order.status;
        } else if (change.type === 'added') {
          const order = change.doc.data() as Order;
          previousStatusMap.current[change.doc.id] = order.status;
        }
      });
    }, (error) => {
      console.warn("Order notifications snapshot error:", error);
    });

    return () => unsubscribe();
  }, [user]);
  
  return null;
}
