import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { FileText, Download, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { getStrategicRecommendations } from '../services/geminiService';

interface ReportsProps {
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'PL' | 'RECOM'>('PL');
  const [recommendations, setRecommendations] = useState<string>('');
  const [loadingRecom, setLoadingRecom] = useState(false);

  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const groupedIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

  const groupedExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

  useEffect(() => {
    if (activeTab === 'RECOM' && !recommendations && transactions.length > 0) {
        setLoadingRecom(true);
        getStrategicRecommendations({ totalIncome, totalExpense, netProfit })
            .then(text => setRecommendations(text))
            .finally(() => setLoadingRecom(false));
    }
  }, [activeTab, transactions.length, totalIncome, totalExpense, netProfit, recommendations]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
        <button
            onClick={() => setActiveTab('PL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'PL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
            Laporan Laba Rugi
        </button>
        <button
            onClick={() => setActiveTab('RECOM')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'RECOM' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
            Rekomendasi Strategis (AI)
        </button>
      </div>

      {activeTab === 'PL' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto">
            <div className="p-8 border-b border-slate-100 text-center">
                <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Laporan Laba Rugi</h2>
                <p className="text-slate-500 mt-1">Periode: Semua Waktu</p>
            </div>
            
            <div className="p-8 space-y-6">
                {/* Income Section */}
                <div>
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5" />
                        PENDAPATAN
                    </h3>
                    <div className="space-y-2 pl-7">
                        {Object.entries(groupedIncome).map(([cat, amount]) => (
                            <div key={cat} className="flex justify-between text-slate-700 border-b border-slate-50 py-1">
                                <span>{cat}</span>
                                <span>Rp {amount.toLocaleString()}</span>
                            </div>
                        ))}
                        {Object.keys(groupedIncome).length === 0 && <p className="text-slate-400 italic">Belum ada pendapatan</p>}
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 mt-2 bg-green-50 p-2 rounded">
                        <span>Total Pendapatan</span>
                        <span>Rp {totalIncome.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Expense Section */}
                <div>
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-3">
                        <TrendingDown className="w-5 h-5" />
                        BEBAN / PENGELUARAN
                    </h3>
                    <div className="space-y-2 pl-7">
                        {Object.entries(groupedExpense).map(([cat, amount]) => (
                            <div key={cat} className="flex justify-between text-slate-700 border-b border-slate-50 py-1">
                                <span>{cat}</span>
                                <span>Rp {amount.toLocaleString()}</span>
                            </div>
                        ))}
                         {Object.keys(groupedExpense).length === 0 && <p className="text-slate-400 italic">Belum ada pengeluaran</p>}
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 mt-2 bg-red-50 p-2 rounded">
                        <span>Total Beban</span>
                        <span>(Rp {totalExpense.toLocaleString('id-ID')})</span>
                    </div>
                </div>

                {/* Net Profit */}
                <div className="border-t-2 border-slate-800 pt-4 mt-6">
                     <div className="flex justify-between text-xl font-bold text-slate-900">
                        <span>LABA / (RUGI) BERSIH</span>
                        <span className={netProfit < 0 ? 'text-red-600' : 'text-blue-600'}>
                            Rp {netProfit.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium text-sm">
                    <Download className="w-4 h-4" />
                    Unduh PDF
                </button>
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                    <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Rekomendasi Peningkatan Kesiapan</h2>
                    <p className="text-sm text-slate-500">Analisis strategis untuk pertumbuhan UMKM Anda.</p>
                </div>
            </div>

            {loadingRecom ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
            ) : (
                <div className="prose prose-slate max-w-none">
                    {/* Render basic markdown-like content safely */}
                    {recommendations.split('\n').map((line, i) => (
                        <p key={i} className={`mb-2 ${line.startsWith('*') || line.startsWith('-') ? 'pl-4' : ''}`}>
                            {line.replace(/^[\*\-]\s/, '• ')}
                        </p>
                    ))}
                    {recommendations === "" && <p className="text-slate-500">Tidak ada data cukup untuk memberikan rekomendasi.</p>}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Reports;