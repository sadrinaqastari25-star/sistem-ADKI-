import React, { useState } from 'react';
import { Transaction, RiskAssessment, Product } from '../types';
import { analyzeFinancialRisk } from '../services/geminiService';
import { ShieldCheck, AlertOctagon, RefreshCw, CheckCircle, Info } from 'lucide-react';

interface RiskCenterProps {
  transactions: Transaction[];
  products: Product[];
  currentAssessment: RiskAssessment | null;
  onAssessmentUpdate: (assessment: RiskAssessment) => void;
}

const RiskCenter: React.FC<RiskCenterProps> = ({ transactions, products, currentAssessment, onAssessmentUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFinancialRisk(transactions, products);
      if (result) {
        onAssessmentUpdate(result);
      } else {
        setError("Gagal mendapatkan analisis dari AI. Pastikan API Key valid.");
      }
    } catch (err) {
        setError("Terjadi kesalahan saat menghubungi layanan AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pusat Kepatuhan & Risiko (AI)</h2>
          <p className="text-slate-500">Deteksi otomatis anomali keuangan dan inventaris.</p>
        </div>
        <button
          onClick={handleAnalysis}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all ${
            loading
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
          {loading ? 'Menganalisis...' : 'Jalankan Analisis Risiko'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertOctagon className="w-5 h-5" />
            {error}
        </div>
      )}

      {currentAssessment ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-lg font-medium text-slate-600 mb-2">Skor Risiko Keseluruhan</h3>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40">
                  <circle
                    className="text-slate-100"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                  <circle
                    className={`${currentAssessment.overallScore > 50 ? 'text-red-500' : 'text-green-500'}`}
                    strokeWidth="12"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * currentAssessment.overallScore) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-4xl font-bold ${currentAssessment.overallScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {currentAssessment.overallScore}
                  </span>
                  <span className="text-xs text-slate-400">dari 100</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Terakhir diperbarui: {new Date(currentAssessment.lastUpdated).toLocaleString('id-ID')}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5" />
                    Saran Strategis AI
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                    {currentAssessment.generalAdvice}
                </p>
            </div>
          </div>

          {/* Anomalies List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Daftar Anomali & Rekomendasi</h3>
              </div>
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {currentAssessment.anomalies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <CheckCircle className="w-16 h-16 mb-4 text-green-500 opacity-50" />
                        <p>Tidak ditemukan anomali berisiko tinggi.</p>
                        <p className="text-sm">Sistem kontrol internal Anda berjalan baik.</p>
                    </div>
                ) : (
                    currentAssessment.anomalies.map((anomaly, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-200 transition-all bg-white">
                        <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                anomaly.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                                anomaly.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {anomaly.severity}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                                ID: {anomaly.transactionId ? anomaly.transactionId.substring(0,8) : 'GENERAL'}
                            </span>
                        </div>
                        </div>
                        <p className="font-medium text-slate-800 mb-2">{anomaly.description}</p>
                        <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 border-l-4 border-indigo-500">
                            <strong>Rekomendasi:</strong> {anomaly.recommendation}
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                <ShieldCheck className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Belum ada analisis risiko</h3>
            <p className="text-slate-500 max-w-md mt-2">
                Tekan tombol "Jalankan Analisis Risiko" di atas untuk membiarkan AI memeriksa data transaksi dan stok Anda.
            </p>
        </div>
      )}
    </div>
  );
};

export default RiskCenter;