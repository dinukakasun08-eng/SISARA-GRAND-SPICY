import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuSection from "./components/MenuSection";
import CartDrawer from "./components/CartDrawer";
import AdminDashboard from "./components/AdminDashboard";
import MyOrders from "./components/MyOrders";
import ReviewsSection from "./components/ReviewsSection";
import TutorialModal from "./components/TutorialModal";
import OrderNotifications from "./components/OrderNotifications";
import { MenuItem, CartItem, Order } from "./types";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, doc, onSnapshot } from "firebase/firestore";
import { Toaster, toast } from "react-hot-toast";
import { calculateDistance } from "./lib/utils";

export default function App() {
  const [currentView, setView] = useState<"menu" | "admin" | "my-orders">(
    "menu",
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [perKmRate, setPerKmRate] = useState<number>(50);
  const [restaurantLocation, setRestaurantLocation] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 7.1558, lng: 80.0505 });
  const [heroMediaUrl, setHeroMediaUrl] = useState<string>("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "delivery"),
      (doc) => {
        if (doc.exists()) {
          setPerKmRate(doc.data().perKmRate || 50);
          if (doc.data().restaurantLocation) {
            setRestaurantLocation(doc.data().restaurantLocation);
          }
          if (doc.data().heroMediaUrl) {
            setHeroMediaUrl(doc.data().heroMediaUrl);
          } else {
            setHeroMediaUrl("");
          }
        } else {
          setHeroMediaUrl("");
        }
      },
      (error) => {
        console.warn("Settings snapshot error:", error);
        // Fallback to empty string so it uses the local default hero image
        setHeroMediaUrl("");
      },
    );

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  // Reference for scrolling to the menu from the Hero section
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add Item to Cart
  const handleAddToCart = (item: MenuItem) => {
    toast.success(
      <span>
        Added <b>{item.name}</b>. Click the Cart icon to place your order!
      </span>,
      { duration: 4000 },
    );
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (cartItem) => cartItem.menuItem.id === item.id,
      );
      if (existingIndex > -1) {
        // Increment quantity
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1,
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
    const itemId = typeof itemOrId === "string" ? itemOrId : itemOrId.id;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (cartItem) => cartItem.menuItem.id === itemId,
      );
      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        const currentQty = updatedCart[existingIndex].quantity;
        if (currentQty > 1) {
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: currentQty - 1,
          };
          return updatedCart;
        } else {
          // Remove from cart when quantity drops below 1
          return updatedCart.filter(
            (cartItem) => cartItem.menuItem.id !== itemId,
          );
        }
      }
      return prevCart;
    });
  };

  // Fully purge an item from the cart
  const handleClearCartItem = (itemId: string) => {
    setCart((prevCart) =>
      prevCart.filter((cartItem) => cartItem.menuItem.id !== itemId),
    );
  };

  // Place Order API Call
  const handlePlaceOrder = async (formData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    coordinates: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    } | null;
    specialInstructions?: string;
  }) => {
    try {
      // Structure the order items list
      const orderItems = cart.map((item) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
      }));

      const subtotal = cart.reduce(
        (acc, item) => acc + item.menuItem.price * item.quantity,
        0,
      );

      let deliveryFee = 0;
      if (formData.coordinates) {
        const distance = calculateDistance(
          restaurantLocation.lat,
          restaurantLocation.lng,
          formData.coordinates.latitude,
          formData.coordinates.longitude,
        );
        deliveryFee = distance * perKmRate;
      } else {
        // Fallback fee if no location
        deliveryFee = 150;
      }

      const totalAmount = subtotal + deliveryFee;

      const orderData = {
        customerId: user ? user.uid : "guest",
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        coordinates: formData.coordinates,
        items: orderItems,
        totalAmount,
        status: "pending",
        createdAt: new Date().toISOString(),
        specialInstructions: formData.specialInstructions || "",
        additionalFee: 0,
        additionalFeeReason: "",
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);

      const completedOrder: Order = {
        id: docRef.id,
        ...orderData,
      } as Order;

      // Order placed successfully - empty local cart
      setCart([]);
      return completedOrder;
    } catch (error) {
      console.error("Order dispatch error:", error);
      alert(
        "We had trouble submitting your order to the kitchen. Please check your connectivity or try again.",
      );
      return null;
    }
  };

  // Count of items in the cart
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans selection:bg-amber-100 selection:text-amber-900"
    >
      <Toaster position="top-center" />
      <OrderNotifications />
      {/* 1. Brand Navigation Header */}
      <Header
        currentView={currentView}
        setView={setView}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        user={user}
      />

      {/* 2. Main Viewport Routing */}
      <main className="flex-1">
        {currentView === "menu" ? (
          <div id="view-customer-menu">
            {/* Hero Welcoming Section */}
            <Hero onExploreClick={scrollToMenu} heroMediaUrl={heroMediaUrl} />

            {/* Target scroll anchor container */}
            <div ref={menuRef} id="menu-scroll-anchor" className="scroll-mt-16">
              <MenuSection
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
              />
            </div>

            <ReviewsSection />
          </div>
        ) : currentView === "my-orders" ? (
          <MyOrders />
        ) : (
          <div id="view-admin-dashboard">
            <AdminDashboard />
          </div>
        )}
      </main>

      <TutorialModal />

      {/* 3. Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCartItem={handleClearCartItem}
        onPlaceOrder={handlePlaceOrder}
        perKmRate={perKmRate}
        restaurantLocation={restaurantLocation}
      />

      {/* 4. Footer */}
      <footer
        id="app-footer"
        className="bg-gray-900 text-gray-400 py-10 border-t border-gray-800"
      >
        <div className="mx-auto max-w-7xl px-4 text-center space-y-3 sm:px-6 lg:px-8">
          <p className="font-sans text-sm font-bold text-white tracking-wider uppercase">
            Sisara Restaurant
          </p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Gourmet delicacies prepared under pristine sanitary guidelines.
            Pinned GPS routing coordinates are fully encrypted for your absolute
            privacy.
          </p>
          <div className="text-[11px] text-gray-600 font-mono pt-4 flex flex-col space-y-1">
            <span>
              © 2026 Sisara Restaurant. Veyangoda, Sri Lanka. All Rights
              Reserved.
            </span>
            <span className="text-gray-400 font-medium">
              Developer: DINUKA KASUN | Contact: +94786241514
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
