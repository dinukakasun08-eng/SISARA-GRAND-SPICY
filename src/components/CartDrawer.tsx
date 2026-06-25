import React, { useState } from 'react';
import { X, ArrowLeft, ShoppingCart, Trash2, ArrowRight, CheckCircle2, Clock, MapPin, Receipt, Phone, Loader2 } from 'lucide-react';
import { CartItem, MenuItem, Order } from '../types';
import CheckoutForm from './CheckoutForm';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onClearCartItem: (itemId: string) => void;
  onPlaceOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    coordinates: { latitude: number; longitude: number; accuracy?: number } | null;
  }) => Promise<Order | null>;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCartItem,
  onPlaceOrder
}: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'receipt'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const deliveryFee = subtotal > 30 ? 0 : 3.50; // Free delivery for orders over $30
  const totalAmount = subtotal + deliveryFee;

  const handleCheckoutSubmit = async (formData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    coordinates: { latitude: number; longitude: number; accuracy?: number } | null;
  }) => {
    setIsSubmitting(true);
    try {
      const order = await onPlaceOrder(formData);
      if (order) {
        setCompletedOrder(order);
        setStep('receipt');
      }
    } catch (e) {
      console.error('Failed to submit checkout:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetReceipt = () => {
    setCompletedOrder(null);
    setStep('cart');
    onClose();
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden">
      {/* Background Dim Backdrop */}
      <div 
        id="cart-backdrop"
        onClick={step !== 'receipt' ? onClose : undefined} 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
        <div id="cart-panel" className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-gray-100">
          
          {/* Header Panel */}
          <div className="px-4 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between sm:px-6">
            {step === 'checkout' ? (
              <button
                id="btn-back-to-cart"
                onClick={() => setStep('cart')}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-850"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Cart</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <h3 className="font-sans text-base font-bold text-gray-900">
                  {step === 'receipt' ? 'Order Receipt' : 'Your Shopping Cart'}
                </h3>
              </div>
            )}

            {step !== 'receipt' && (
              <button
                id="btn-close-drawer"
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Core Scrollable Drawer Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {step === 'cart' && (
              <>
                {cart.length > 0 ? (
                  <div id="cart-items-list" className="space-y-5">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        id={`cart-row-${item.menuItem.id}`}
                        className="flex items-start gap-4 rounded-xl border border-gray-150 p-3 shadow-2xs hover:border-gray-250 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                          <img
                            src={item.menuItem.imageUrl}
                            alt={item.menuItem.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Text and Adjuster info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-bold text-gray-900 truncate pr-2">
                              {item.menuItem.name}
                            </h4>
                            <button
                              id={`btn-clear-${item.menuItem.id}`}
                              onClick={() => onClearCartItem(item.menuItem.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-mono text-xs text-gray-500 mt-0.5">
                            ${item.menuItem.price.toFixed(2)} each
                          </p>

                          {/* Inline Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2.5 rounded-lg bg-gray-100 p-0.5">
                              <button
                                id={`btn-drawer-dec-${item.menuItem.id}`}
                                onClick={() => onRemoveFromCart(item.menuItem.id as any)}
                                className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-gray-700 shadow-3xs hover:bg-gray-50 active:scale-90 transition-all"
                              >
                                <X className="h-2 w-2 hidden" />
                                <span className="text-xs font-bold leading-none">-</span>
                              </button>
                              <span className="font-mono text-xs font-bold text-gray-800 w-3 text-center">
                                {item.quantity}
                              </span>
                              <button
                                id={`btn-drawer-inc-${item.menuItem.id}`}
                                onClick={() => onAddToCart(item.menuItem)}
                                className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-600 text-white shadow-3xs hover:bg-amber-700 active:scale-90 transition-all"
                              >
                                <span className="text-xs font-bold leading-none">+</span>
                              </button>
                            </div>
                            <span className="font-mono text-xs font-bold text-gray-900">
                              ${(item.menuItem.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div id="cart-empty-state" className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4 shadow-3xs">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-bold text-gray-900">Your cart is empty</h4>
                    <p className="mt-2 text-xs text-gray-500 max-w-xs leading-relaxed">
                      Add delicious culinary masterpieces from our digital menu to place your delivery order!
                    </p>
                    <button
                      id="btn-return-menu"
                      onClick={onClose}
                      className="mt-6 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
                    >
                      Browse Digital Menu
                    </button>
                  </div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <CheckoutForm
                totalAmount={totalAmount}
                onSubmit={handleCheckoutSubmit}
                isSubmitting={isSubmitting}
              />
            )}

            {step === 'receipt' && completedOrder && (
              <div id="receipt-container" className="space-y-6">
                {/* Success Indicator */}
                <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 shadow-xs animate-pulse">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="font-sans text-lg font-bold text-gray-900">Order Placed Successfully!</h4>
                  <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mt-2">
                    Order ID: {completedOrder.id}
                  </p>
                  <p className="text-xs text-gray-500 mt-3 max-w-xs leading-relaxed">
                    Thank you for ordering from **Sisara Restaurant**! Your food is being prepared with top-tier culinary care.
                  </p>
                </div>

                {/* Delivery Time & Contact info */}
                <div className="space-y-3.5 rounded-2xl bg-gray-50 border border-gray-150 p-4 shadow-3xs">
                  <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-amber-600" />
                    <span>Delivery Estimate</span>
                  </h5>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-[10px] text-gray-400">ETA Delivery</p>
                        <p className="text-xs font-bold text-gray-800">30 - 45 Mins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-[10px] text-gray-400">Recipient Contact</p>
                        <p className="text-xs font-bold text-gray-800 truncate">{completedOrder.customerPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200/60 pt-3 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">Delivery Location</p>
                      <p className="text-xs font-semibold text-gray-800 leading-normal">{completedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Encrypted map confirmation receipt */}
                {completedOrder.coordinates && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <span>✓ Shared Pin Confirmed</span>
                    </h5>
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                      <iframe
                        width="100%"
                        height="130"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={`https://maps.google.com/maps?q=${completedOrder.coordinates.latitude},${completedOrder.coordinates.longitude}&z=15&output=embed`}
                        className="block w-full border-0"
                        title="Delivery Destination Map"
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Items Summary Table */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Ordered Items</h5>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {completedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 text-xs">
                        <span className="text-gray-600">
                          {item.name} <strong className="text-gray-900 font-mono">x{item.quantity}</strong>
                        </span>
                        <span className="font-mono font-semibold text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-900">Total Paid</span>
                    <span className="font-mono text-amber-700">${completedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action */}
                <button
                  id="btn-close-receipt"
                  type="button"
                  onClick={handleResetReceipt}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 py-3.5 text-xs font-bold text-white hover:bg-gray-800 active:scale-95 transition-all"
                >
                  Return to Digital Menu
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer Panel (Only visible for step 1 when cart has items) */}
          {step === 'cart' && cart.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-5 sm:px-6 shadow-sm">
              <div className="space-y-2.5 mb-5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Cart Subtotal</span>
                  <span className="font-mono font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Estimated Delivery</span>
                  <span className="font-mono font-medium text-gray-800">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-[10px] text-amber-700 italic bg-amber-50 px-2 py-1 rounded border border-amber-100">
                    💡 Spend **${(30 - subtotal).toFixed(2)}** more for **FREE** delivery!
                  </p>
                )}
                <div className="border-t border-gray-200/60 pt-2.5 flex justify-between text-sm font-bold text-gray-900">
                  <span>Total Due</span>
                  <span className="font-mono text-amber-700">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="btn-goto-checkout"
                onClick={() => setStep('checkout')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-amber-700 active:scale-95 transition-all"
              >
                <span>Proceed to Delivery Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
