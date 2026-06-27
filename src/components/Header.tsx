import React from 'react';
import { ShoppingBag, Utensils, ShieldAlert, LogIn, LogOut, ClipboardList } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import logoImg from '../assets/images/sisara_logo_1782465035165.jpg';

interface HeaderProps {
  currentView: 'menu' | 'admin' | 'my-orders';
  setView: (view: 'menu' | 'admin' | 'my-orders') => void;
  cartCount: number;
  onCartClick: () => void;
  user: any;
}

export default function Header({ currentView, setView, cartCount, onCartClick, user }: HeaderProps) {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('menu');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          id="logo-container"
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('menu')}
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm shadow-amber-600/30">
            <img src={logoImg} alt="Sisara Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-gray-900 sm:flex sm:items-center sm:gap-1.5 leading-tight">
              <span className="font-sinhala font-bold text-xl sm:text-2xl tracking-normal block sm:inline">සිසාරා</span>
              <span className="text-amber-600 text-[10px] sm:text-base block sm:inline">GRAND SPICY</span>
            </h1>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex rounded-lg bg-gray-100 p-0.5">
            <button
              id="nav-btn-menu"
              onClick={() => setView('menu')}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                currentView === 'menu'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Utensils className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Digital Menu</span>
            </button>
            {user && (
              <button
                onClick={() => setView('my-orders')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  currentView === 'my-orders'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ClipboardList className="h-3 w-3" />
                <span className="hidden sm:inline">My Orders</span>
              </button>
            )}
            <button
              id="nav-btn-admin"
              onClick={() => setView('admin')}
              className={`hidden md:flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                currentView === 'admin'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShieldAlert className="h-3 w-3" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-2 sm:pl-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-medium text-gray-900 leading-tight">{user.displayName}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Icon (Only visible on customer menu) */}
            {(currentView === 'menu' || currentView === 'my-orders') && (
              <button
                id="cart-trigger-btn"
                onClick={onCartClick}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 hover:text-amber-600 active:scale-95"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 font-mono text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
