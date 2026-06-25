import React from 'react';
import { ShoppingBag, Utensils, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentView: 'menu' | 'admin';
  setView: (view: 'menu' | 'admin') => void;
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ currentView, setView, cartCount, onCartClick }: HeaderProps) {
  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          id="logo-container"
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('menu')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shadow-amber-600/30">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Sisara <span className="text-amber-600">Restaurant</span>
            </h1>
            <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest leading-none">Aromas of the East</p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-4">
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
              <span>Digital Menu</span>
            </button>
            <button
              id="nav-btn-admin"
              onClick={() => setView('admin')}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                currentView === 'admin'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Admin Dashboard</span>
            </button>
          </div>

          {/* Cart Icon (Only visible on customer menu) */}
          {currentView === 'menu' && (
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
    </header>
  );
}
