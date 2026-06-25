import React from 'react';
import { ArrowDown, Flame, Sparkles, Clock, MapPin } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  return (
    <div id="hero-banner" className="relative overflow-hidden bg-gray-950 py-16 sm:py-24">
      {/* Visual background artwork with an elegant radial gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop&q=80"
          alt="Sisara Restaurant Culinary"
          className="h-full w-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.15),transparent_45%)]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 mb-6">
            <Sparkles className="h-3 w-3" />
            <span>Award-Winning Asian Fusion Dining</span>
          </div>

          {/* Heading */}
          <h2 className="font-sans text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Pure Taste <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              With Grand Spicy
            </span>
          </h2>

          {/* Key Quick Info Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-sans">Open Daily</p>
                <p className="text-xs font-bold text-white font-sans">11:00 AM - 10:00 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-amber-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-sans">Location</p>
                <p className="text-xs font-bold text-white font-sans">Veyangoda, Sri Lanka</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-sans">Delivery Speed</p>
                <p className="text-xs font-bold text-white font-sans">Within 35 Mins</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 hover:from-amber-600 hover:to-amber-700 transition-all active:scale-95"
            >
              <span>Explore Interactive Menu</span>
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </button>
            <button
              id="hero-scroll-btn"
              onClick={onExploreClick}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/15 transition-all border border-white/5 active:scale-95"
            >
              Order Online Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
