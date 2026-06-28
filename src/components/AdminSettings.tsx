import React, { useState, useEffect } from 'react';
import { Save, Loader2, Settings, MapPin, Navigation, UploadCloud, FileText } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ReceiptSettings } from '../types';

export default function AdminSettings() {
  const [perKmRate, setPerKmRate] = useState<number>(0);
  const [restaurantLocation, setRestaurantLocation] = useState<{lat: number, lng: number} | null>(null);
  const [heroMediaUrl, setHeroMediaUrl] = useState<string>('');
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    headerText: 'Sisara Grand Spicy',
    footerText: 'Thank you for your order!',
    address: 'Veyangoda, Sri Lanka',
    phone: '+94 78 624 1514',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'delivery');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPerKmRate(data.perKmRate || 0);
          setRestaurantLocation(data.restaurantLocation || { lat: 7.1558, lng: 80.0505 });
          setHeroMediaUrl(data.heroMediaUrl || '');
          if (data.receiptSettings) {
            setReceiptSettings(data.receiptSettings);
          }
        } else {
          // Initialize if it doesn't exist
          const defaultSettings = { 
            perKmRate: 50, 
            restaurantLocation: { lat: 7.1558, lng: 80.0505 }, 
            heroMediaUrl: '',
            receiptSettings: {
              headerText: 'Sisara Grand Spicy',
              footerText: 'Thank you for your order!',
              address: 'Veyangoda, Sri Lanka',
              phone: '+94 78 624 1514',
              logoUrl: ''
            }
          };
          await setDoc(docRef, defaultSettings);
          setPerKmRate(50);
          setRestaurantLocation(defaultSettings.restaurantLocation);
          setHeroMediaUrl('');
          setReceiptSettings(defaultSettings.receiptSettings);
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
      await setDoc(doc(db, 'settings', 'delivery'), { perKmRate, restaurantLocation, heroMediaUrl, receiptSettings });
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1048576) { // 1MB limit for firestore document
      alert("File is too large! Please select an image under 1MB. (Note: Video uploads may require external URL hosting due to size limits)");
      return;
    }

    setUploadingMedia(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroMediaUrl(reader.result as string);
        setUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to read file.");
      setUploadingMedia(false);
    }
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
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://example.com/image.jpg or video.mp4"
                value={heroMediaUrl}
                onChange={(e) => setHeroMediaUrl(e.target.value)}
                className="flex-1 border border-gray-200 py-2.5 px-4 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <label className="cursor-pointer bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center">
                {uploadingMedia ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : <UploadCloud className="w-5 h-5 text-gray-600" />}
                <input type="file" className="hidden" accept="image/*,video/mp4,video/webm" onChange={handleMediaUpload} disabled={uploadingMedia} />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave blank to use the default image. Provide a valid URL or upload a file (image or .mp4, .webm).
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-amber-600" />
              <h3 className="text-md font-bold text-gray-900">Receipt Print Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Store Name (Header)</label>
                <input
                  type="text"
                  value={receiptSettings.headerText}
                  onChange={(e) => setReceiptSettings({...receiptSettings, headerText: e.target.value})}
                  className="w-full border border-gray-200 py-2 px-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Store Address</label>
                <input
                  type="text"
                  value={receiptSettings.address}
                  onChange={(e) => setReceiptSettings({...receiptSettings, address: e.target.value})}
                  className="w-full border border-gray-200 py-2 px-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={receiptSettings.phone}
                  onChange={(e) => setReceiptSettings({...receiptSettings, phone: e.target.value})}
                  className="w-full border border-gray-200 py-2 px-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Thank You Message (Footer)</label>
                <input
                  type="text"
                  value={receiptSettings.footerText}
                  onChange={(e) => setReceiptSettings({...receiptSettings, footerText: e.target.value})}
                  className="w-full border border-gray-200 py-2 px-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
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
