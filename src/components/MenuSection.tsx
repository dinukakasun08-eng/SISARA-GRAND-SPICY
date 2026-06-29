import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Flame,
  Leaf,
  Award,
  Plus,
  Minus,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { MenuItem, CartItem } from "../types";

interface MenuSectionProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
}

export default function MenuSection({
  cart,
  onAddToCart,
  onRemoveFromCart,
}: MenuSectionProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "All" | "Appetizers" | "Mains" | "Desserts" | "Drinks"
  >("All");
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  const [filterSpicy, setFilterSpicy] = useState(false);
  const [filterPopular, setFilterPopular] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter logic
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesVegetarian = !filterVegetarian || item.isVegetarian;
    const matchesSpicy = !filterSpicy || item.isSpicy;
    const matchesPopular = !filterPopular || item.isPopular;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesVegetarian &&
      matchesSpicy &&
      matchesPopular
    );
  });

  // Helper to find quantity of an item in the cart
  const getItemQuantity = (itemId: string) => {
    const found = cart.find((item) => item.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <section
      id="menu-workspace"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      {/* Menu Header Title */}
      <div className="text-center md:text-left mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="font-sans text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Explore Our Digital <span className="text-amber-600">Menu</span>
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-lg">
            Each recipe is an exquisite masterpiece of aroma, flavor, and fresh
            ingredients. Order for prompt home delivery.
          </p>
        </div>

        {/* Quick Tags Toggle Row */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            id="tag-filter-veg"
            onClick={() => setFilterVegetarian(!filterVegetarian)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filterVegetarian
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
            }`}
          >
            <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            <span>Vegetarian</span>
          </button>

          <button
            id="tag-filter-spicy"
            onClick={() => setFilterSpicy(!filterSpicy)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filterSpicy
                ? "bg-rose-100 text-rose-800 border border-rose-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            <span>Spicy</span>
          </button>

          <button
            id="tag-filter-pop"
            onClick={() => setFilterPopular(!filterPopular)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filterPopular
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
            }`}
          >
            <Award className="h-3.5 w-3.5 text-amber-600" />
            <span>Popular</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Panel */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="relative md:col-span-4">
          <Search className="absolute top-3.5 left-3.5 h-4 w-4 text-gray-400" />
          <input
            id="menu-search-input"
            type="text"
            placeholder="Search our delicious dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
          />
        </div>

        {/* Category filter tabs */}
        <div className="md:col-span-8 flex items-center overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex gap-2 w-full">
            {(
              ["All", "Appetizers", "Mains", "Desserts", "Drinks"] as const
            ).map((category) => (
              <button
                key={category}
                id={`category-tab-${category}`}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 rounded-xl px-4 py-3 text-xs font-semibold transition-all ${
                  activeCategory === category
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Loading our fresh menu...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div
          id="menu-items-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredItems.map((item) => {
            const quantity = getItemQuantity(item.id);
            return (
              <div
                key={item.id}
                id={`menu-card-${item.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-150 transition-all hover:-translate-y-1 hover:shadow-md hover:border-gray-250"
              >
                {/* Product Image and Overlay Tags */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-gray-800 shadow-sm border border-gray-200/55">
                    {item.category}
                  </span>

                  {/* Attribute badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {item.isPopular && (
                      <span className="flex items-center gap-0.5 rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                        <Award className="h-2.5 w-2.5" />
                        <span>POPULAR</span>
                      </span>
                    )}
                    {item.isSpicy && (
                      <span className="flex items-center gap-0.5 rounded-md bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                        <Flame className="h-2.5 w-2.5" />
                        <span>SPICY</span>
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="flex items-center gap-0.5 rounded-md bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                        <Leaf className="h-2.5 w-2.5" />
                        <span>VEG</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-sans text-base font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <p className="mt-2 flex-1 text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    {/* Price */}
                    <span className="font-mono text-base font-bold text-gray-900">
                      LKR {item.price.toFixed(2)}
                    </span>

                    {/* Interactive Quantity Adjuster or Add Button */}
                    {quantity > 0 ? (
                      <div className="flex items-center gap-3.5 rounded-xl bg-amber-50 p-1 border border-amber-200">
                        <button
                          id={`btn-dec-${item.id}`}
                          onClick={() => onRemoveFromCart(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-amber-700 shadow-xs hover:bg-amber-100 active:scale-95 transition-all"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-extrabold text-amber-900 w-4 text-center">
                          {quantity}
                        </span>
                        <button
                          id={`btn-inc-${item.id}`}
                          onClick={() => onAddToCart(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-add-${item.id}`}
                        onClick={() => onAddToCart(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 active:scale-95 transition-all"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          id="no-items-state"
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 px-4 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h4 className="text-base font-semibold text-gray-900">
            No delicious matches found
          </h4>
          <p className="mt-1 text-xs text-gray-500 max-w-xs">
            We couldn't find items matching your search or tags. Adjust filters
            or try searching for another dish!
          </p>
          <button
            id="clear-filters-btn"
            onClick={() => {
              setSearchTerm("");
              setActiveCategory("All");
              setFilterVegetarian(false);
              setFilterSpicy(false);
              setFilterPopular(false);
            }}
            className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
}
