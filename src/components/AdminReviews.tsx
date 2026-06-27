import React, { useState, useEffect } from 'react';
import { Star, Trash2, Pin, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  pinned?: boolean;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTogglePin = async (id: string, currentPinStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'reviews', id), {
        pinned: !currentPinStatus
      });
    } catch (err) {
      console.error('Failed to toggle pin', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (err) {
        console.error('Failed to delete review', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Manage Reviews</h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
          {reviews.length} total
        </span>
      </div>

      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div key={review.id} className={`bg-white rounded-2xl p-6 border transition-all ${review.pinned ? 'border-amber-400 shadow-amber-500/10 shadow-lg' : 'border-gray-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    {review.customerName}
                    {review.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-current" />}
                  </h4>
                  <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{review.comment}</p>
              
              <div className="flex items-center gap-2 border-t border-gray-100 pt-4 mt-auto">
                <button
                  onClick={() => handleTogglePin(review.id, review.pinned || false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${review.pinned ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Pin className="w-4 h-4" />
                  {review.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900">No reviews</h4>
          <p className="text-gray-500 mt-1">Customers haven't left any reviews yet.</p>
        </div>
      )}
    </div>
  );
}
