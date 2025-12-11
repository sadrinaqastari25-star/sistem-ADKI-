import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transaction, TransactionType, Product } from '../types';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Package } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  riskScore: number | null;
  products?: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, riskScore, products = [] }) => {
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Inventory stats
  const lowStockItems = products.filter(p => p.stock <= 5);
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);

  // Prepare data for chart
  const chartData = transactions.slice(-10).map((t, index) => ({
    name: index + 1,
    amount: t.amount,
    type: t.type,
    desc: t.description
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Pendapatan</p>
            <h3 className="text-2xl font-bold text-slate-800">Rp {totalIncome.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold text-slate-800">Rp {totalExpense.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Laba Bersih</p>
            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              Rp {netProfit.toLocaleString('id-ID')}
            </h3>
          </div>
        </div>

        {/* Risk Score Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
          <div className={`p-3 rounded-full ${riskScore && riskScore > 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Skor Risiko (AI)</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {riskScore !== null ? `${riskScore}/100` : '-'}
            </h3>
          </div>
          {riskScore !== null && (
            <div className={`absolute bottom-0 left-0 h-1 bg-current w-full ${riskScore > 50 ? 'text-red-500' : 'text-green-500'}`} style={{ width: `${riskScore}%` }}></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Arus Transaksi Terakhir</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="desc" hide />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === TransactionType.INCOME ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Summary Widget */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5" /> Ringkasan Inventaris
            </h3>
            
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Nilai Aset Stok</p>
                    <p className="text-xl font-bold text-slate-800">Rp {totalStockValue.toLocaleString()}</p>
                </div>

                <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Peringatan Stok Rendah</p>
                    {lowStockItems.length > 0 ? (
                        <ul className="space-y-2">
                            {lowStockItems.slice(0, 5).map(item => (
                                <li key={item.id} className="flex justify-between items-center text-sm p-2 bg-red-50 text-red-700 rounded border border-red-100">
                                    <span>{item.name}</span>
                                    <span className="font-bold">{item.stock} {item.unit}</span>
                                </li>
                            ))}
                            {lowStockItems.length > 5 && (
                                <li className="text-xs text-center text-slate-500 pt-1">+ {lowStockItems.length - 5} item lainnya</li>
                            )}
                        </ul>
                    ) : (
                        <p className="text-sm text-green-600 bg-green-50 p-3 rounded">Semua stok aman.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;