import React, { useState, useEffect } from 'react';
import { Save, Loader2, Settings, MapPin, Navigation } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminSettings() {
  const [perKmRate, setPerKmRate] = useState<number>(0);
  const [restaurantLocation, setRestaurantLocation] = useState<{lat: number, lng: number} | null>(null);
  const [heroMediaUrl, setHeroMediaUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'delivery');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPerKmRate(docSnap.data().perKmRate || 0);
          setRestaurantLocation(docSnap.data().restaurantLocation || { lat: 7.1558, lng: 80.0505 });
          setHeroMediaUrl(docSnap.data().heroMediaUrl || '');
        } else {
          // Initialize if it doesn't exist
          const defaultSettings = { perKmRate: 50, restaurantLocation: { lat: 7.1558, lng: 80.0505 }, heroMediaUrl: '' };
          await setDoc(docRef, defaultSettings);
          setPerKmRate(50);
          setRestaurantLocation(defaultSettings.restaurantLocation);
          setHeroMediaUrl('');
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'delivery'), { perKmRate, restaurantLocation, heroMediaUrl });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLocation = () => {
    setGeoLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRestaurantLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoLoading(false);
      },
      (error) => {
        console.error('GPS Error:', error);
        alert('Failed to get location. Please ensure location permissions are granted.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 flex items-center gap-3">
          <Settings className="text-amber-600 w-5 h-5" />
          <h2 className="text-lg font-bold text-gray-900">Store Settings</h2>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {saveSuccess && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3 text-sm font-medium">
              Settings saved successfully.
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Delivery Rate (Per Kilometer)
            </label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-r-0 border-gray-200 text-gray-500 px-4 py-2.5 rounded-l-xl font-bold">
                LKR
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={perKmRate}
                onChange={(e) => setPerKmRate(parseFloat(e.target.value) || 0)}
                className="flex-1 border border-gray-200 py-2.5 px-4 rounded-r-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This rate will be multiplied by the distance (in km) to calculate the estimated delivery fee for customers.
            </p>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Admin Login Place (Restaurant Location)
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  {restaurantLocation ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Current Location Pinned</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          Lat: {restaurantLocation.lat.toFixed(6)}, Lng: {restaurantLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No location set</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  The delivery distance will be calculated from this coordinate to the customer's location.
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleUpdateLocation}
                disabled={geoLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 text-amber-600" />}
                Update Location
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hero Banner Image/Video URL
            </label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="https://example.com/image.jpg or video.mp4"
                value={heroMediaUrl}
                onChange={(e) => setHeroMediaUrl(e.target.value)}
                className="w-full border border-gray-200 py-2.5 px-4 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave blank to use the default image. Provide a valid URL to an image or video (.mp4, .webm).
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
