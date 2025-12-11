import React, { useState } from 'react';
import { Product, Contact } from '../types';
import { Plus, Trash2, Package, Users, Tag } from 'lucide-react';

interface MasterDataProps {
  products: Product[];
  contacts: Contact[];
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddContact: (c: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const MasterData: React.FC<MasterDataProps> = ({ 
  products, contacts, onAddProduct, onDeleteProduct, onAddContact, onDeleteContact 
}) => {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CONTACTS'>('PRODUCTS');
  
  // Product Form State
  const [prodForm, setProdForm] = useState({ name: '', category: '', stock: '0', price: '0', cost: '0', unit: 'Pcs' });
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', role: 'CUSTOMER' as const, phone: '' });

  // Safe ID generation
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      id: generateId(),
      name: prodForm.name,
      category: prodForm.category,
      stock: parseInt(prodForm.stock) || 0,
      price: parseFloat(prodForm.price) || 0,
      cost: parseFloat(prodForm.cost) || 0,
      unit: prodForm.unit
    });
    setProdForm({ name: '', category: '', stock: '0', price: '0', cost: '0', unit: 'Pcs' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContact({
      id: generateId(),
      name: contactForm.name,
      role: contactForm.role,
      phone: contactForm.phone
    });
    setContactForm({ name: '', role: 'CUSTOMER', phone: '' });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 bg-white p-2 rounded-lg border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'PRODUCTS' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Package size={18} />
          <span>Produk & Stok</span>
        </button>
        <button
          onClick={() => setActiveTab('CONTACTS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'CONTACTS' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users size={18} />
          <span>Kontak & Rekanan</span>
        </button>
      </div>

      {activeTab === 'PRODUCTS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" /> Tambah Produk
            </h3>
            <form onSubmit={handleProductSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Produk</label>
                <input required type="text" className="w-full p-2 border rounded-md" 
                  value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Kategori</label>
                  <input type="text" className="w-full p-2 border rounded-md" placeholder="Makanan"
                    value={prodForm.category} onChange={e => setProdForm({...prodForm, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Satuan</label>
                  <input type="text" className="w-full p-2 border rounded-md" placeholder="Pcs"
                    value={prodForm.unit} onChange={e => setProdForm({...prodForm, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Harga Beli (HPP)</label>
                  <input required type="number" className="w-full p-2 border rounded-md" 
                    value={prodForm.cost} onChange={e => setProdForm({...prodForm, cost: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Harga Jual</label>
                  <input required type="number" className="w-full p-2 border rounded-md" 
                    value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Stok Awal</label>
                <input required type="number" className="w-full p-2 border rounded-md" 
                  value={prodForm.stock} onChange={e => setProdForm({...prodForm, stock: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Simpan Produk</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Daftar Inventaris</h3>
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">Total: {products.length} item</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nama Produk</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-right">Stok</th>
                    <th className="px-4 py-3 text-right">Harga Jual</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.category}</td>
                      <td className={`px-4 py-3 text-right font-medium ${p.stock <= 5 ? 'text-red-600' : 'text-slate-700'}`}>
                        {p.stock} {p.unit}
                      </td>
                      <td className="px-4 py-3 text-right">Rp {p.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => onDeleteProduct(p.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">Belum ada data produk.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" /> Tambah Kontak
            </h3>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Lengkap / Perusahaan</label>
                <input required type="text" className="w-full p-2 border rounded-md" 
                  value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tipe</label>
                <select className="w-full p-2 border rounded-md" 
                  value={contactForm.role} onChange={e => setContactForm({...contactForm, role: e.target.value as any})}>
                    <option value="CUSTOMER">Pelanggan</option>
                    <option value="SUPPLIER">Suplier / Pemasok</option>
                    <option value="EMPLOYEE">Karyawan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nomor Telepon</label>
                <input type="text" className="w-full p-2 border rounded-md" 
                  value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Simpan Kontak</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-4 border-b bg-slate-50">
                <h3 className="font-bold text-slate-700">Daftar Kontak</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Telepon</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contacts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          c.role === 'CUSTOMER' ? 'bg-green-50 border-green-200 text-green-700' : 
                          c.role === 'SUPPLIER' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                          'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          {c.role === 'CUSTOMER' ? 'Pelanggan' : c.role === 'SUPPLIER' ? 'Suplier' : 'Karyawan'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{c.phone || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => onDeleteContact(c.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                   {contacts.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-slate-400">Belum ada data kontak.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;