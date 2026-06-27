import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { MenuItem } from '../types';
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Mains',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    isPopular: false
  });

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setProducts(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), formData);
      } else {
        await addDoc(collection(db, 'products'), formData);
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        name: '', description: '', price: 0, category: 'Mains', imageUrl: '',
        isVegetarian: false, isSpicy: false, isPopular: false
      });
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleEdit = (product: MenuItem) => {
    setFormData(product);
    setEditingId(product.id);
    setIsAdding(true);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-amber-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Manage Menu Items</h3>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({
              name: '', description: '', price: 0, category: 'Mains', imageUrl: '',
              isVegetarian: false, isSpicy: false, isPopular: false
            });
          }}
          className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-700"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6 space-y-4">
          <h4 className="font-bold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Price (LKR)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border p-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded-lg text-sm">
                <option>Appetizers</option>
                <option>Mains</option>
                <option>Desserts</option>
                <option>Drinks</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Image URL</label>
              <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border p-2 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded-lg text-sm" rows={2}></textarea>
            </div>
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.isVegetarian} onChange={e => setFormData({...formData, isVegetarian: e.target.checked})} /> Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.isSpicy} onChange={e => setFormData({...formData, isSpicy: e.target.checked})} /> Spicy
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} /> Popular
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Check className="w-4 h-4"/> Save</button>
            <button onClick={() => setIsAdding(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><X className="w-4 h-4"/> Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold">Image</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  </td>
                  <td className="p-4 font-bold text-gray-900">{p.name}</td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4 font-mono font-bold text-gray-600">LKR {p.price.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No products found. Add some!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
