export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum Category {
  SALES = 'Penjualan',
  SERVICE = 'Jasa',
  OTHER_INCOME = 'Pendapatan Lain',
  COGS = 'HPP (Bahan Baku)',
  OPERATIONAL = 'Operasional',
  SALARY = 'Gaji Karyawan',
  MARKETING = 'Pemasaran',
  OTHER_EXPENSE = 'Pengeluaran Lain',
  INVENTORY_PURCHASE = 'Pembelian Stok',
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number; // Selling Price
  cost: number; // Cost of Goods
  unit: string;
}

export interface Contact {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE';
  phone?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  user: string; // Who input this (for audit)
  
  // Integration Fields
  contactId?: string;
  contactName?: string; // Denormalized for easier display
  productId?: string;
  productName?: string; // Denormalized
  quantity?: number;
}

export interface RiskAnomaly {
  transactionId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  recommendation: string;
}

export interface RiskAssessment {
  overallScore: number; // 0-100, higher is riskier
  anomalies: RiskAnomaly[];
  generalAdvice: string;
  lastUpdated: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}