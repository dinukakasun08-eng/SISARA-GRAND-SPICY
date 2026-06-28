import React from "react";
import { ArrowDown, Flame, Sparkles, Clock, MapPin } from "lucide-react";
import heroImage from "../assets/images/wok_fire_cooking_1782459770453.jpg";

interface HeroProps {
  onExploreClick: () => void;
  heroMediaUrl?: string | null;
}

export default function Hero({ onExploreClick, heroMediaUrl }: HeroProps) {
  return (
    <div
      id="hero-banner"
      className="relative overflow-hidden bg-gray-950 py-16 sm:py-24 transition-opacity duration-500"
    >
      {/* Visual background artwork with an elegant radial gradient overlay */}
      <div className="absolute inset-0 z-0">
        {heroMediaUrl && heroMediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
          <video
            src={heroMediaUrl}
            className="h-full w-full object-cover opacity-40"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={heroMediaUrl || heroImage}
            alt="Chef cooking with fire"
            className="h-full w-full object-cover opacity-40 transition-opacity duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.15),transparent_45%)]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Heading */}
          <h2 className="font-sinhala text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
            පිරිසිදු රසවත් ආහාර
            <br />
            ඔබේ දොරකඩටම ගෙන්වා ගන්න
          </h2>

          {/* Key Quick Info Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-sans">Open Daily</p>
                <p className="text-xs font-bold text-white font-sans">
                  11:00 AM - 10:00 PM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-amber-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-sans">Location</p>
                <p className="text-xs font-bold text-white font-sans">
                  Veyangoda, Sri Lanka
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-sans">
                  Delivery Speed
                </p>
                <p className="text-xs font-bold text-white font-sans">
                  Within 35 Mins
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              id="hero-scroll-btn"
              onClick={onExploreClick}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 hover:from-amber-600 hover:to-amber-700 transition-all active:scale-95"
            >
              Order Online Now
              <ArrowDown className="h-4 w-4 animate-bounce ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
