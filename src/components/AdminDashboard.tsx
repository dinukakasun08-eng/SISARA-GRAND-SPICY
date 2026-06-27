import React, { useState, useEffect } from "react";
import {
  Shield,
  Loader2,
  RefreshCw,
  Phone,
  Clock,
  MapPin,
  ExternalLink,
  Activity,
  CheckCircle,
  Flame,
  Check,
  Ban,
  LogOut,
  LogIn,
  Package,
  ClipboardList,
  KeyRound,
  User,
  Settings,
  Star,
  Trash2,
  Bike,
} from "lucide-react";
import { Order } from "../types";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import AdminProducts from "./AdminProducts";
import AdminSettings from "./AdminSettings";
import AdminReviews from "./AdminReviews";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [syncTime, setSyncTime] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "orders" | "products" | "settings" | "reviews"
  >("orders");

  // Custom Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("sisara_admin_auth") === "true",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const prevOrdersLength = React.useRef(0);
  const initialLoadDone = React.useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        // Play sound if new order received
        if (
          initialLoadDone.current &&
          fetchedOrders.length > prevOrdersLength.current
        ) {
          const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
          );
          audio.play().catch((e) => console.error("Audio play failed", e));
        }

        prevOrdersLength.current = fetchedOrders.length;
        if (!initialLoadDone.current) {
          initialLoadDone.current = true;
        }

        setOrders(fetchedOrders);

        const now = new Date();
        setSyncTime(
          now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
        setOrdersLoading(false);
      },
      (error) => {
        console.error("Failed to sync orders:", error);
        setOrdersLoading(false);
      },
    );

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "ADMIN_SISARA112" && password === "200732503140") {
      setIsAuthenticated(true);
      localStorage.setItem("sisara_admin_auth", "true");
      setLoginError("");
      setUsername("");
      setPassword("");
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("sisara_admin_auth");
    setOrders([]);
  };

  const handleStatusChange = async (
    orderId: string,
    nextStatus: Order["status"],
  ) => {
    setUpdatingOrderId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: nextStatus });
    } catch (err) {
      console.error("Failed to change order status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleClearOrders = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all current orders? This action cannot be undone and will permanently remove all order records from the database.",
      )
    ) {
      setOrdersLoading(true);
      try {
        const q = query(collection(db, "orders"));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        setOrders([]);
      } catch (error) {
        console.error("Failed to clear orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    }
  };

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    onWay: orders.filter((o) => o.status === "on_way").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((acc, o) => acc + o.totalAmount, 0),
  };

  if (!isAuthenticated) {
    return (
      <div id="admin-login-gate" className="mx-auto max-w-md px-4 py-20">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="bg-amber-600 px-6 py-8 text-center text-white">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 mb-4">
              <Shield className="h-6 w-6 text-white animate-pulse" />
            </div>
            <h3 className="font-sans text-xl font-bold">
              Restaurant Administration
            </h3>
            <p className="text-xs text-amber-100 mt-1">
              Authorized access required
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute top-3.5 left-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute top-3.5 left-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {loginError && (
              <div className="rounded-lg bg-red-50 border border-red-150 p-3 text-xs text-red-800 leading-normal font-sans">
                <strong>Access Denied:</strong> {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 py-3.5 text-xs font-bold text-white hover:bg-gray-800 active:scale-95 transition-all"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              <span>Login to Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD WORKSPACE
  return (
    <div
      id="admin-dashboard-container"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="font-sans text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Sisara Kitchen <span className="text-amber-600">Admin</span>
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-amber-500" />
            <span>
              Secure connection live. Active polling feed updates automatically.
            </span>
          </p>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center mr-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "orders" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <ClipboardList className="w-4 h-4" /> Orders
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "products" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Package className="w-4 h-4" /> Products
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "settings" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "reviews" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Star className="w-4 h-4" /> Reviews
            </button>
          </div>

          {syncTime && activeTab === "orders" && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl">
                Synced:{" "}
                <strong className="text-gray-700 font-bold">{syncTime}</strong>
              </span>
              <button
                onClick={handleClearOrders}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 text-xs font-bold active:scale-95 transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Daily Orders
              </button>
            </div>
          )}

          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200/50 px-3.5 py-2 text-xs font-bold text-red-700 active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </div>

      {activeTab === "products" ? (
        <AdminProducts />
      ) : activeTab === "settings" ? (
        <AdminSettings />
      ) : activeTab === "reviews" ? (
        <AdminReviews />
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {/* Pending Card */}
            <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                  Pending
                </p>
                <p className="font-mono text-xl font-bold text-gray-900 mt-1">
                  {stats.pending}
                </p>
              </div>
            </div>

            {/* Preparing Card */}
            <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Flame className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                  Cooking
                </p>
                <p className="font-mono text-xl font-bold text-gray-900 mt-1">
                  {stats.preparing}
                </p>
              </div>
            </div>

            {/* On Way Card */}
            <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bike className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                  On Way
                </p>
                <p className="font-mono text-xl font-bold text-gray-900 mt-1">
                  {stats.onWay}
                </p>
              </div>
            </div>

            {/* Delivered Card */}
            <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                  Delivered
                </p>
                <p className="font-mono text-xl font-bold text-gray-900 mt-1">
                  {stats.delivered}
                </p>
              </div>
            </div>

            {/* Cancelled Card */}
            <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Ban className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                  Cancelled
                </p>
                <p className="font-mono text-xl font-bold text-gray-900 mt-1">
                  {stats.cancelled}
                </p>
              </div>
            </div>

            {/* Total revenue Card */}
            <div className="col-span-2 lg:col-span-1 rounded-2xl border border-amber-600/10 bg-amber-500/5 p-4 shadow-3xs flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shadow-amber-600/20">
                <span className="text-xs font-bold">LKR</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide leading-none">
                  Completed Sales
                </p>
                <p className="font-mono text-xl font-bold text-amber-950 mt-1">
                  LKR {stats.revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Orders Feed Feed */}
          {ordersLoading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-150 shadow-3xs">
              <Loader2 className="h-10 w-10 text-amber-600 animate-spin mb-4" />
              <h4 className="text-base font-bold text-gray-900">
                Synchronizing database...
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Please wait while we establish connection and decrypt records.
              </p>
            </div>
          ) : orders.length > 0 ? (
            <div id="admin-orders-list" className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  id={`admin-order-card-${order.id}`}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-xs transition-all hover:shadow-md ${
                    order.status === "pending"
                      ? "border-amber-400 shadow-amber-500/5"
                      : order.status === "preparing"
                        ? "border-orange-400 shadow-orange-500/5"
                        : order.status === "on_way"
                          ? "border-blue-400 shadow-blue-500/5"
                          : "border-gray-200"
                  }`}
                >
                  {/* Order Card Head */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50/50 px-5 py-4 border-b border-gray-100 gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-black text-gray-800 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                        Order ID: {order.id}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </span>
                    </div>

                    {/* Status action buttons */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide mr-1.5">
                        Action Status:
                      </span>

                      {updatingOrderId === order.id ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {order.status === "pending" && (
                            <button
                              id={`btn-status-prep-${order.id}`}
                              onClick={() =>
                                handleStatusChange(order.id, "preparing")
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 text-xs font-bold transition-all shadow-3xs"
                            >
                              <Flame className="h-3 w-3" />
                              <span>Cook Food</span>
                            </button>
                          )}

                          {(order.status === "pending" || order.status === "preparing") && (
                            <button
                              id={`btn-status-onway-${order.id}`}
                              onClick={() =>
                                handleStatusChange(order.id, "on_way")
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 text-xs font-bold transition-all shadow-3xs"
                            >
                              <Bike className="h-3 w-3" />
                              <span>On Way</span>
                            </button>
                          )}

                          {order.status !== "delivered" &&
                            order.status !== "cancelled" && (
                              <button
                                id={`btn-status-deliv-${order.id}`}
                                onClick={() =>
                                  handleStatusChange(order.id, "delivered")
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-bold transition-all shadow-3xs"
                              >
                                <Check className="h-3 w-3" />
                                <span>Complete Delivery</span>
                              </button>
                            )}

                          {order.status !== "cancelled" &&
                            order.status !== "delivered" && (
                              <button
                                id={`btn-status-cancel-${order.id}`}
                                onClick={() =>
                                  handleStatusChange(order.id, "cancelled")
                                }
                                className="rounded-lg bg-white border border-red-200/75 hover:bg-red-50 text-red-600 px-2.5 py-1.5 text-xs font-bold transition-all"
                              >
                                Cancel
                              </button>
                            )}

                          {order.status === "delivered" && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 text-xs font-extrabold">
                              ✓ Completed & Delivered
                            </span>
                          )}

                          {order.status === "cancelled" && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 text-red-850 px-3 py-1.5 text-xs font-extrabold">
                              Order Cancelled
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Card Content split */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-150">
                    {/* Left side: Order Items and Prices (7cols) */}
                    <div className="lg:col-span-7 p-5">
                      <h5 className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">
                        Order details
                      </h5>
                      <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl overflow-hidden bg-gray-50/20 shadow-3xs mb-4">
                        {order.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center px-4 py-3 text-xs"
                          >
                            <div>
                              <p className="font-bold text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-gray-400 mt-0.5">
                                Unit: LKR {item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 font-mono">
                                x{item.quantity}
                              </p>
                              <p className="font-mono text-gray-500 mt-0.5">
                                LKR {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center rounded-xl bg-gray-100 p-4 font-sans text-sm">
                        <span className="font-bold text-gray-700">
                          Total Charged
                        </span>
                        <span className="font-mono text-lg font-black text-amber-700">
                          LKR {order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Recipient, Encrypted GPS routing & Maps (5cols) */}
                    <div className="lg:col-span-5 p-5 bg-gray-50/30 flex flex-col justify-between">
                      <div>
                        <h5 className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">
                          Delivery Dispatch Routing
                        </h5>

                        {/* Customer info */}
                        <div className="space-y-3 font-sans text-xs mb-4">
                          <div className="flex items-center gap-2">
                            <strong className="text-gray-800 text-sm font-bold block">
                              {order.customerName}
                            </strong>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-amber-600" />
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-amber-700 font-bold hover:underline"
                            >
                              {order.customerPhone}
                            </a>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-amber-600 mt-0.5" />
                            <p className="text-gray-600 leading-normal">
                              {order.deliveryAddress}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5 mt-2">
                            <label className="text-xs font-bold text-gray-700">
                              Delivery Guy Number:
                            </label>
                            <input
                              type="text"
                              placeholder="Enter number..."
                              className="px-3 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-amber-500 outline-none w-full"
                              defaultValue={order.deliveryGuyNumber || ""}
                              onBlur={(e) => {
                                if (
                                  e.target.value !== order.deliveryGuyNumber
                                ) {
                                  updateDoc(doc(db, "orders", order.id), {
                                    deliveryGuyNumber: e.target.value,
                                  }).catch((err) => console.error(err));
                                }
                              }}
                            />
                            <p className="text-[10px] text-gray-400">
                              Number will save automatically when you click
                              outside.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* GPS & MAP CONTAINER */}
                      <div className="border-t border-gray-150 pt-4">
                        {order.coordinates ? (
                          <div className="space-y-3">
                            {/* Driving directions buttons */}
                            <div className="flex items-center justify-between gap-2.5">
                              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md leading-none">
                                ✓ Precise GPS Connected
                              </span>

                              <a
                                id={`btn-directions-${order.id}`}
                                href={`https://www.google.com/maps/dir/?api=1&destination=${order.coordinates.latitude},${order.coordinates.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-850 hover:underline"
                              >
                                <span>Open Driving Directions</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>

                            {/* Interactive map widget */}
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-3xs relative h-28">
                              <iframe
                                width="100%"
                                height="112"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={`https://maps.google.com/maps?q=${order.coordinates.latitude},${order.coordinates.longitude}&z=15&output=embed`}
                                className="block w-full border-0"
                                title="Interactive dispatch routing map"
                              ></iframe>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 text-center">
                            <MapPin className="mx-auto h-5 w-5 text-gray-400 mb-1.5" />
                            <p className="text-[11px] font-bold text-gray-600">
                              No GPS Signal Shared
                            </p>
                            <p className="text-[9px] text-gray-400 mt-0.5 max-w-[180px] mx-auto leading-normal">
                              User checked out without pinning GPS. Deliver
                              manually to the provided street address above.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              id="empty-orders-state"
              className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-150 shadow-3xs"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4 shadow-3xs">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900">
                No incoming delivery orders
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                The database is currently clear. Place customer orders on the
                digital menu tab to watch this live feed populate instantly!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
