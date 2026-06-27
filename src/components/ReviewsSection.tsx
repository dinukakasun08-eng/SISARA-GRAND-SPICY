import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  pinned?: boolean;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      // Sort pinned reviews to the top
      const sortedReviews = fetchedReviews.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
      
      setReviews(sortedReviews);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        customerName: name,
        rating,
        comment,
        createdAt: new Date().toISOString()
      });
      setSubmitSuccess(true);
      setName('');
      setComment('');
      setRating(5);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Reviews</h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">See what our customers have to say about our food and service.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Add Review Form */}
          <div className="lg:col-span-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Leave a Review</h3>
            
            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-center">
                <p className="font-bold">Thank you!</p>
                <p className="text-sm mt-1">Your review has been published.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1 transition-colors ${star <= rating ? 'text-amber-500' : 'text-gray-300'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    required
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !comment.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Post Review</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map(review => (
                  <div key={review.id} className={`bg-white rounded-2xl p-6 border ${review.pinned ? 'border-amber-400 shadow-amber-500/10 shadow-md' : 'border-gray-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          {review.customerName}
                          {review.pinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                              Pinned
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900">No reviews yet</h4>
                <p className="text-gray-500 mt-1">Be the first to leave a review!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
