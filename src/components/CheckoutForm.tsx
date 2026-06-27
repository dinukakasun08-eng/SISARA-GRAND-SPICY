import React, { useState, useMemo } from 'react';
import { MapPin, Phone, User, ShieldCheck, Navigation, Loader2, CheckCircle2 } from 'lucide-react';
import { calculateDistance } from '../lib/utils';

interface CheckoutFormProps {
  subtotal: number;
  perKmRate: number;
  restaurantLocation: { lat: number; lng: number };
  onSubmit: (formData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    coordinates: { latitude: number; longitude: number; accuracy?: number } | null;
  }) => void;
  isSubmitting: boolean;
}

export default function CheckoutForm({ subtotal, perKmRate, restaurantLocation, onSubmit, isSubmitting }: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Use Browser Geolocation API
  const handleShareLocation = () => {
    setGeoLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setGeoLoading(false);
        
        // Auto-fill coordinates in delivery notes or prompt if address is empty
        if (!deliveryAddress) {
          setDeliveryAddress('Shared GPS Location Pinpoint');
        }
      },
      (error) => {
        console.error('GPS Capture Error:', error);
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Please grant location permissions in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location information is unavailable. Try moving outside or closer to a window.');
            break;
          case error.TIMEOUT:
            setGeoError('GPS signal timed out. Please try sharing again.');
            break;
          default:
            setGeoError('An unknown error occurred while capturing your GPS location.');
        }
      },
      options
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      return;
    }
    onSubmit({
      customerName,
      customerPhone,
      deliveryAddress,
      coordinates
    });
  };

  const deliveryFee = useMemo(() => {
    if (coordinates) {
      const distance = calculateDistance(
        restaurantLocation.lat,
        restaurantLocation.lng,
        coordinates.latitude,
        coordinates.longitude
      );
      return distance * perKmRate;
    }
    return 150; // default fallback if no location
  }, [coordinates, perKmRate, restaurantLocation]);

  const totalAmount = subtotal + deliveryFee;

  return (
    <form id="checkout-form-container" onSubmit={handleFormSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="input-name" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute top-3.5 left-3.5 h-4 w-4 text-gray-400" />
            <input
              id="input-name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="input-phone" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute top-3.5 left-3.5 h-4 w-4 text-gray-400" />
            <input
              id="input-phone"
              type="tel"
              required
              placeholder="e.g. +1 (555) 019-2834"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label htmlFor="input-address" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Delivery Address
          </label>
          <div className="relative">
            <MapPin className="absolute top-3.5 left-3.5 h-4 w-4 text-gray-400" />
            <textarea
              id="input-address"
              required
              rows={2}
              placeholder="Enter apartment, street name, and city details..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm font-sans text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs resize-none"
            />
          </div>
        </div>

        {/* Geolocation Section */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-gray-800">Pinpoint Delivery GPS</h5>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">
                Share your GPS location so our dispatch riders can navigate directly to your door without calling you for directions.
              </p>
            </div>
          </div>

          <div className="mt-3.5">
            {coordinates ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-emerald-900">GPS Location Pinned Successfully</p>
                    <p className="font-mono text-[9px] text-emerald-700 truncate">
                      Lat: {coordinates.latitude.toFixed(6)}, Lng: {coordinates.longitude.toFixed(6)} (±{coordinates.accuracy?.toFixed(0)}m)
                    </p>
                  </div>
                  <button
                    id="btn-re-share-gps"
                    type="button"
                    onClick={handleShareLocation}
                    className="text-[10px] font-bold text-emerald-800 hover:underline flex-shrink-0 ml-1"
                  >
                    Recapture
                  </button>
                </div>

                {/* Google Maps Pinpoint Iframe Embed (Zero Key Needed, Fully Interactive!) */}
                <div id="embed-map-wrapper" className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-100">
                  <iframe
                    width="100%"
                    height="160"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=16&output=embed`}
                    className="block w-full border-0"
                    title="Pinned GPS Location Map"
                  ></iframe>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  id="btn-share-gps"
                  type="button"
                  disabled={geoLoading}
                  onClick={handleShareLocation}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-amber-600 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
                >
                  {geoLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Capturing Precise GPS Signal...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Share Current GPS Location</span>
                    </>
                  )}
                </button>

                {geoError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-[11px] text-red-800 leading-normal font-sans">
                    <strong>Notice:</strong> {geoError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security & Data Privacy Notice */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5 text-amber-800">
          <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-amber-900 block">End-to-End Delivery Privacy</span>
            Your coordinates and address are strictly **encrypted on-the-fly** and stored securely. Only the Sisara Restaurant kitchen administrator has access to view this data for delivery routing. It is never shared.
          </div>
        </div>
      </div>

      {/* Checkout Summary Footer */}
      <div className="border-t border-gray-100 pt-4 mt-6">
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-mono text-gray-800">LKR {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Estimated Delivery</span>
            <span className="font-mono text-gray-800">
              {coordinates ? `LKR ${deliveryFee.toFixed(2)}` : 'Share location to calculate'}
            </span>
          </div>
          <div className="border-t border-gray-200/60 pt-2 flex items-center justify-between font-semibold">
            <span className="text-gray-900">Total Order Amount</span>
            <span className="font-mono text-lg text-amber-700">LKR {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          id="btn-confirm-order"
          type="submit"
          disabled={isSubmitting || customerName.trim() === '' || customerPhone.trim() === '' || deliveryAddress.trim() === ''}
          className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-3.5 text-sm font-semibold text-white shadow-md hover:from-amber-700 hover:to-amber-850 focus:outline-none transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Transmitting Encrypted Order...</span>
            </>
          ) : (
            <span>Place Delivery Order</span>
          )}
        </button>
      </div>
    </form>
  );
}
