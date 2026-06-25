import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import { MenuItem, CartItem, Order } from './types';

export default function App() {
  const [currentView, setView] = useState<'menu' | 'admin'>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Reference for scrolling to the menu from the Hero section
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add Item to Cart
  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((cartItem) => cartItem.menuItem.id === item.id);
      if (existingIndex > -1) {
        // Increment quantity
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, { menuItem: item, quantity: 1 }];
      }
    });
  };

  // Decrement/Remove Item from Cart
  const handleRemoveFromCart = (itemOrId: any) => {
    const itemId = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((cartItem) => cartItem.menuItem.id === itemId);
      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        const currentQty = updatedCart[existingIndex].quantity;
        if (currentQty > 1) {
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: currentQty - 1
          };
          return updatedCart;
        } else {
          // Remove from cart when quantity drops below 1
          return updatedCart.filter((cartItem) => cartItem.menuItem.id !== itemId);
        }
      }
      return prevCart;
    });
  };

  // Fully purge an item from the cart
  const handleClearCartItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.menuItem.id !== itemId));
  };

  // Place Order API Call
  const handlePlaceOrder = async (formData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    coordinates: { latitude: number; longitude: number; accuracy?: number } | null;
  }) => {
    try {
      // Structure the order items list
      const orderItems = cart.map((item) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity
      }));

      const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
      const deliveryFee = subtotal > 30 ? 0 : 3.50;
      const totalAmount = subtotal + deliveryFee;

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          deliveryAddress: formData.deliveryAddress,
          coordinates: formData.coordinates,
          items: orderItems,
          totalAmount
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to place order');
      }

      const completedOrder: Order = await response.json();
      
      // Order placed successfully - empty local cart
      setCart([]);
      return completedOrder;
    } catch (error) {
      console.error('Order dispatch error:', error);
      alert('We had trouble submitting your order to the kitchen. Please check your connectivity or try again.');
      return null;
    }
  };

  // Count of items in the cart
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div id="app-root-container" className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. Brand Navigation Header */}
      <Header
        currentView={currentView}
        setView={setView}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* 2. Main Viewport Routing */}
      <main className="flex-1">
        {currentView === 'menu' ? (
          <div id="view-customer-menu">
            {/* Hero Welcoming Section */}
            <Hero onExploreClick={scrollToMenu} />

            {/* Target scroll anchor container */}
            <div ref={menuRef} id="menu-scroll-anchor" className="scroll-mt-16">
              <MenuSection
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
              />
            </div>
          </div>
        ) : (
          <div id="view-admin-dashboard">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* 3. Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCartItem={handleClearCartItem}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* 4. Footer */}
      <footer id="app-footer" className="bg-gray-900 text-gray-400 py-10 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 text-center space-y-3 sm:px-6 lg:px-8">
          <p className="font-sans text-sm font-bold text-white tracking-wider uppercase">Sisara Restaurant</p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Gourmet delicacies prepared under pristine sanitary guidelines. Pinned GPS routing coordinates are fully encrypted for your absolute privacy.
          </p>
          <p className="text-[10px] text-gray-600 font-mono pt-4">
            © 2026 Sisara Restaurant. Veyangoda, Sri Lanka. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
