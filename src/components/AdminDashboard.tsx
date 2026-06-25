import React, { useState, useEffect, useRef } from 'react';
import { Shield, KeyRound, Loader2, RefreshCw, Phone, Clock, DollarSign, MapPin, ExternalLink, Activity, CheckCircle, Flame, Check, Ban } from 'lucide-react';
import { Order } from '../types';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sisara_admin_token'));
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [syncTime, setSyncTime] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Auto-polling interval reference
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoginLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        setToken(data.token);
        localStorage.setItem('sisara_admin_token', data.token);
        setPassword('');
      } else {
        setError(data.message || 'Authentication failed. Please verify your password.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Network communication failure. Ensure the server is online.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout admin
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('sisara_admin_token');
    setOrders([]);
  };

  // Fetch orders from secure decrypted endpoint
  const fetchOrders = async (showSpinner = false) => {
    if (!token) return;
    if (showSpinner) setOrdersLoading(true);

    try {
      const response = await fetch('/api/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If token expired or invalid, force logout
      if (response.status === 403 || response.status === 401) {
        handleLogout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        const now = new Date();
        setSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to sync orders:', err);
    } finally {
      if (showSpinner) setOrdersLoading(false);
    }
  };

  // Update order status
  const handleStatusChange = async (orderId: string, nextStatus: Order['status']) => {
    if (!token) return;
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        // Update local state directly for fast UI responsiveness
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
        );
      }
    } catch (err) {
      console.error('Failed to change order status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Sync orders on login or token state
  useEffect(() => {
    if (token) {
      fetchOrders(true);

      // Establish real-time active polling every 12 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchOrders(false);
      }, 12000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [token]);

  // Status statistics helper
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.totalAmount, 0)
  };

  // 1. LOGIN GATE
  if (!token) {
    return (
      <div id="admin-login-gate" className="mx-auto max-w-md px-4 py-20">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="bg-amber-600 px-6 py-8 text-center text-white">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 mb-4">
              <Shield className="h-6 w-6 text-white animate-pulse" />
            </div>
            <h3 className="font-sans text-xl font-bold">Restaurant Administration</h3>
            <p className="text-xs text-amber-100 mt-1">Authorized login to process secure orders and GPS routes</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="admin-pass" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <KeyRound className="absolute top-3.5 left-3.5 h-4 w-4 text-gray-400" />
                <input
                  id="admin-pass"
                  type="password"
                  required
                  placeholder="Enter admin password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-150 p-3 text-xs text-red-800 leading-normal font-sans">
                <strong>Access Denied:</strong> {error}
              </div>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loginLoading || !password}
              className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 py-3.5 text-xs font-bold text-white hover:bg-gray-800 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard Workspace</span>
              )}
            </button>
            <div className="text-center pt-2">
              <p className="text-[10px] text-gray-400 italic">
                * Default developer password is: <strong className="text-gray-500">sisara123</strong>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD WORKSPACE
  return (
    <div id="admin-dashboard-container" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="font-sans text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Sisara Kitchen <span className="text-amber-600">Admin Feed</span>
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-amber-500" />
            <span>Secure connection live. Active polling feed updates automatically.</span>
          </p>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-3">
          {syncTime && (
            <span className="font-mono text-xs text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl">
              Synced: <strong className="text-gray-700 font-bold">{syncTime}</strong>
            </span>
          )}

          <button
            id="admin-sync-btn"
            onClick={() => fetchOrders(true)}
            disabled={ordersLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${ordersLoading ? 'animate-spin' : ''}`} />
            <span>Manual Sync</span>
          </button>

          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="rounded-xl bg-red-50 hover:bg-red-100 border border-red-200/50 px-3.5 py-2 text-xs font-bold text-red-700 active:scale-95 transition-all"
          >
            Log Out Securely
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Pending Card */}
        <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">Pending</p>
            <p className="font-mono text-xl font-bold text-gray-900 mt-1">{stats.pending}</p>
          </div>
        </div>

        {/* Preparing Card */}
        <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">Cooking</p>
            <p className="font-mono text-xl font-bold text-gray-900 mt-1">{stats.preparing}</p>
          </div>
        </div>

        {/* Delivered Card */}
        <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">Delivered</p>
            <p className="font-mono text-xl font-bold text-gray-900 mt-1">{stats.delivered}</p>
          </div>
        </div>

        {/* Cancelled Card */}
        <div className="rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Ban className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">Cancelled</p>
            <p className="font-mono text-xl font-bold text-gray-900 mt-1">{stats.cancelled}</p>
          </div>
        </div>

        {/* Total revenue Card */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-amber-600/10 bg-amber-500/5 p-4 shadow-3xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shadow-amber-600/20">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide leading-none">Completed Sales</p>
            <p className="font-mono text-xl font-bold text-amber-950 mt-1">${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Orders Feed Feed */}
      {ordersLoading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-150 shadow-3xs">
          <Loader2 className="h-10 w-10 text-amber-600 animate-spin mb-4" />
          <h4 className="text-base font-bold text-gray-900">Synchronizing database...</h4>
          <p className="text-xs text-gray-500 mt-1">Please wait while we establish connection and decrypt records.</p>
        </div>
      ) : orders.length > 0 ? (
        <div id="admin-orders-list" className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              id={`admin-order-card-${order.id}`}
              className={`overflow-hidden rounded-2xl border bg-white shadow-xs transition-all hover:shadow-md ${
                order.status === 'pending'
                  ? 'border-amber-400 shadow-amber-500/5'
                  : order.status === 'preparing'
                  ? 'border-orange-400 shadow-orange-500/5'
                  : 'border-gray-200'
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
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </span>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide mr-1.5">Action Status:</span>
                  
                  {updatingOrderId === order.id ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {order.status !== 'preparing' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          id={`btn-status-prep-${order.id}`}
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                          className="inline-flex items-center gap-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 text-xs font-bold transition-all shadow-3xs"
                        >
                          <Flame className="h-3 w-3" />
                          <span>Cook Food</span>
                        </button>
                      )}

                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          id={`btn-status-deliv-${order.id}`}
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-bold transition-all shadow-3xs"
                        >
                          <Check className="h-3 w-3" />
                          <span>Complete Delivery</span>
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          id={`btn-status-cancel-${order.id}`}
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="rounded-lg bg-white border border-red-200/75 hover:bg-red-50 text-red-600 px-2.5 py-1.5 text-xs font-bold transition-all"
                        >
                          Cancel
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 text-xs font-extrabold">
                          ✓ Completed & Delivered
                        </span>
                      )}

                      {order.status === 'cancelled' && (
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
                  <h5 className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">Order details</h5>
                  <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl overflow-hidden bg-gray-50/20 shadow-3xs mb-4">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-3 text-xs">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-gray-400 mt-0.5">Unit: ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 font-mono">x{item.quantity}</p>
                          <p className="font-mono text-gray-500 mt-0.5">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center rounded-xl bg-gray-100 p-4 font-sans text-sm">
                    <span className="font-bold text-gray-700">Total Charged</span>
                    <span className="font-mono text-lg font-black text-amber-700">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Right side: Recipient, Encrypted GPS routing & Maps (5cols) */}
                <div className="lg:col-span-5 p-5 bg-gray-50/30 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-3">Delivery Dispatch Routing</h5>
                    
                    {/* Customer info */}
                    <div className="space-y-3 font-sans text-xs mb-4">
                      <div className="flex items-center gap-2">
                        <strong className="text-gray-800 text-sm font-bold block">{order.customerName}</strong>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-amber-600" />
                        <a href={`tel:${order.customerPhone}`} className="text-amber-700 font-bold hover:underline">
                          {order.customerPhone}
                        </a>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-amber-600 mt-0.5" />
                        <p className="text-gray-600 leading-normal">{order.deliveryAddress}</p>
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
                        <p className="text-[11px] font-bold text-gray-600">No GPS Signal Shared</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 max-w-[180px] mx-auto leading-normal">
                          User checked out without pinning GPS. Deliver manually to the provided street address above.
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
        <div id="empty-orders-state" className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-150 shadow-3xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4 shadow-3xs">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-gray-900">No incoming delivery orders</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
            The database is currently clear. Place customer orders on the digital menu tab to watch this live feed populate instantly!
          </p>
        </div>
      )}
    </div>
  );
}
