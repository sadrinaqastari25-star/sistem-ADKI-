import React, { useState, useEffect } from 'react';
import { Transaction, RiskAssessment, Product, Contact, TransactionType } from './types';
import Dashboard from './components/Dashboard';
import TransactionManager from './components/TransactionManager';
import RiskCenter from './components/RiskCenter';
import Reports from './components/Reports';
import MasterData from './components/MasterData';
import { LayoutDashboard, Receipt, ShieldAlert, FileText, Menu, X, Coins, Database } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'MASTER' | 'RISK' | 'REPORTS'>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Simulated Database State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);

  // Load data from local storage on mount (Simulation)
  useEffect(() => {
    const savedTrans = localStorage.getItem('adki_transactions');
    const savedProds = localStorage.getItem('adki_products');
    const savedContacts = localStorage.getItem('adki_contacts');
    const savedRisk = localStorage.getItem('adki_risk');
    
    if (savedTrans) setTransactions(JSON.parse(savedTrans));
    if (savedProds) setProducts(JSON.parse(savedProds));
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedRisk) setRiskAssessment(JSON.parse(savedRisk));
  }, []);

  // Save data on change
  useEffect(() => { localStorage.setItem('adki_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('adki_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('adki_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { if (riskAssessment) localStorage.setItem('adki_risk', JSON.stringify(riskAssessment)); }, [riskAssessment]);

  const handleAddTransaction = (t: Transaction) => {
    setTransactions([t, ...transactions]);

    // INTEGRATION LOGIC: Auto-update stock
    if (t.productId && t.quantity) {
      const productIndex = products.findIndex(p => p.id === t.productId);
      if (productIndex !== -1) {
        const updatedProducts = [...products];
        if (t.type === TransactionType.INCOME) {
          // Sales decrease stock
          updatedProducts[productIndex].stock -= t.quantity;
        } else if (t.type === TransactionType.EXPENSE) {
          // Purchases increase stock
          updatedProducts[productIndex].stock += t.quantity;
        }
        setProducts(updatedProducts);
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx && tx.productId && tx.quantity) {
       // Reverse stock change
       const productIndex = products.findIndex(p => p.id === tx.productId);
       if (productIndex !== -1) {
          const updatedProducts = [...products];
          if (tx.type === TransactionType.INCOME) {
            updatedProducts[productIndex].stock += tx.quantity;
          } else {
            updatedProducts[productIndex].stock -= tx.quantity;
          }
          setProducts(updatedProducts);
       }
    }
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddProduct = (p: Product) => setProducts([...products, p]);
  const handleDeleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  
  const handleAddContact = (c: Contact) => setContacts([...contacts, c]);
  const handleDeleteContact = (id: string) => setContacts(contacts.filter(c => c.id !== id));

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <Coins className="text-blue-400" />
            <h1 className="font-bold text-lg">ADKI</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Coins size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">ADKI</h1>
            <p className="text-xs text-slate-400">Asisten Akuntansi Digital</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem id="DASHBOARD" label="Dashboard" icon={LayoutDashboard} />
          <NavItem id="TRANSACTIONS" label="Transaksi" icon={Receipt} />
          <NavItem id="MASTER" label="Data Master" icon={Database} />
          <NavItem id="RISK" label="Analisis & Risiko" icon={ShieldAlert} />
          <NavItem id="REPORTS" label="Laporan" icon={FileText} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Status Sistem</p>
            <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online & Terintegrasi
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          <header className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              {activeTab === 'DASHBOARD' && 'Dashboard Utama'}
              {activeTab === 'TRANSACTIONS' && 'Manajemen Transaksi'}
              {activeTab === 'MASTER' && 'Data Master (Persediaan & Kontak)'}
              {activeTab === 'RISK' && 'Analisis Risiko & Kepatuhan'}
              {activeTab === 'REPORTS' && 'Laporan Keuangan'}
            </h2>
            <p className="text-slate-500 mt-1">
              Sistem Informasi Akuntansi & Kepatuhan UMKM
            </p>
          </header>

          {activeTab === 'DASHBOARD' && (
            <Dashboard 
              transactions={transactions} 
              riskScore={riskAssessment?.overallScore ?? null} 
              products={products}
            />
          )}

          {activeTab === 'TRANSACTIONS' && (
            <TransactionManager 
              transactions={transactions}
              products={products}
              contacts={contacts}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'MASTER' && (
            <MasterData 
              products={products}
              contacts={contacts}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
            />
          )}

          {activeTab === 'RISK' && (
             <RiskCenter 
              transactions={transactions}
              products={products}
              currentAssessment={riskAssessment}
              onAssessmentUpdate={setRiskAssessment}
            />
          )}

          {activeTab === 'REPORTS' && (
            <Reports transactions={transactions} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;