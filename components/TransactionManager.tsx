import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, Product, Contact } from '../types';
import { Plus, Search, Trash2, Tag, User, ShoppingCart } from 'lucide-react';

interface TransactionManagerProps {
  transactions: Transaction[];
  products: Product[];
  contacts: Contact[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ 
  transactions, products, contacts, onAddTransaction, onDeleteTransaction 
}) => {
  const [formData, setFormData] = useState<{
    description: string;
    amount: string;
    type: TransactionType;
    category: Category;
    contactId: string;
    productId: string;
    quantity: string;
  }>({
    description: '',
    amount: '',
    type: TransactionType.INCOME,
    category: Category.SALES,
    contactId: '',
    productId: '',
    quantity: '1'
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Effect to auto-fill amount based on product price/cost
  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId);
      if (product) {
        const qty = parseFloat(formData.quantity) || 0;
        let unitPrice = 0;
        let defaultDesc = '';
        let defaultCat = formData.category;

        if (formData.type === TransactionType.INCOME) {
           unitPrice = product.price;
           defaultDesc = `Penjualan ${product.name} (${qty} ${product.unit})`;
           defaultCat = Category.SALES;
        } else {
           unitPrice = product.cost;
           defaultDesc = `Pembelian Stok ${product.name} (${qty} ${product.unit})`;
           defaultCat = Category.INVENTORY_PURCHASE;
        }

        const total = unitPrice * qty;
        
        setFormData(prev => ({
          ...prev,
          amount: total > 0 ? total.toString() : prev.amount,
          description: prev.description === '' ? defaultDesc : prev.description,
          category: defaultCat
        }));
      }
    }
  }, [formData.productId, formData.quantity, formData.type, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const selectedContact = contacts.find(c => c.id === formData.contactId);
    const selectedProduct = products.find(p => p.id === formData.productId);
    const amountValue = parseFloat(formData.amount);

    if (isNaN(amountValue)) {
        alert("Mohon masukkan nominal yang valid");
        return;
    }

    // Safer ID generation
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const newTransaction: Transaction = {
      id: generateId(),
      date: new Date().toISOString(),
      description: formData.description,
      amount: amountValue,
      type: formData.type,
      category: formData.category,
      user: 'Pemilik',
      contactId: formData.contactId || undefined,
      contactName: selectedContact?.name,
      productId: formData.productId || undefined,
      productName: selectedProduct?.name,
      quantity: formData.productId ? parseFloat(formData.quantity) : undefined
    };

    onAddTransaction(newTransaction);
    setFormData({
      description: '',
      amount: '',
      type: TransactionType.INCOME,
      category: Category.SALES,
      contactId: '',
      productId: '',
      quantity: '1'
    });
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter contacts based on transaction type for dropdown
  const relevantContacts = contacts.filter(c => {
    if (formData.type === TransactionType.INCOME) return c.role === 'CUSTOMER';
    if (formData.type === TransactionType.EXPENSE) return c.role === 'SUPPLIER';
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
            <Plus className="w-5 h-5 text-blue-600" />
            Catat Transaksi
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Transaksi</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: TransactionType.INCOME, category: Category.SALES, productId: '', contactId: '' })}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
                    formData.type === TransactionType.INCOME 
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE, category: Category.OPERATIONAL, productId: '', contactId: '' })}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                    formData.type === TransactionType.EXPENSE 
                      ? 'bg-red-600 text-white border-red-600' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            {/* INTEGRATION SECTION */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                   <User size={12} /> {formData.type === TransactionType.INCOME ? 'Pelanggan' : 'Suplier'} (Opsional)
                </label>
                <select
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  <option value="">-- Pilih Kontak --</option>
                  {relevantContacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                   <ShoppingCart size={12} /> Produk (Opsional - Auto Stok)
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                  ))}
                </select>
              </div>

              {formData.productId && (
                 <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Jumlah Item</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    min="1"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Akuntansi</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Nominal (Rp)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 font-bold"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                placeholder="Contoh: Penjualan..."
                rows={2}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Simpan Transaksi
            </button>
          </form>
        </div>
      </div>

      {/* Transaction List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Detail</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                      Belum ada data transaksi yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex flex-col">
                          <span className="font-bold">{new Date(t.date).toLocaleDateString('id-ID')}</span>
                          <span className="text-xs">{t.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                         <div className="flex flex-col">
                          <span className="font-medium">{t.description}</span>
                          {t.contactName && (
                             <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                               <User size={10} /> {t.contactName}
                             </span>
                          )}
                          {t.productName && (
                             <span className="text-xs text-blue-500 flex items-center gap-1">
                               <Tag size={10} /> {t.quantity}x {t.productName}
                             </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.type === TransactionType.INCOME ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                        t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionManager;