import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction, RiskAssessment, Product } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const riskResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "A risk score from 0 to 100. 0 is safe, 100 is critical risk.",
    },
    generalAdvice: {
      type: Type.STRING,
      description: "General strategic advice for the business owner regarding their financial health, inventory, and compliance.",
    },
    anomalies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          transactionId: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          description: { type: Type.STRING, description: "Why this transaction or data point is considered anomalous." },
          recommendation: { type: Type.STRING, description: "Actionable step to fix or investigate this anomaly." },
        },
        required: ["transactionId", "severity", "description", "recommendation"],
      },
    },
  },
  required: ["overallScore", "generalAdvice", "anomalies"],
};

export const analyzeFinancialRisk = async (transactions: Transaction[], products: Product[]): Promise<RiskAssessment | null> => {
  if (!apiKey) {
    console.warn("API Key is missing for Gemini Service");
    return null;
  }

  if (transactions.length === 0 && products.length === 0) {
    return {
      overallScore: 0,
      anomalies: [],
      generalAdvice: "Belum ada data transaksi atau inventaris untuk dianalisis.",
      lastUpdated: new Date().toISOString()
    };
  }

  const recentTransactions = transactions.slice(-50);
  const dataContext = JSON.stringify({
      transactions: recentTransactions,
      inventory: products.map(p => ({ name: p.name, stock: p.stock, cost: p.cost, price: p.price }))
  });

  const prompt = `
    Bertindaklah sebagai Auditor Internal dan Ahli Keuangan AI untuk UMKM (ADKI).
    Analisis data JSON berikut (Transaksi & Stok).

    Tugas Anda:
    1. Deteksi anomali Keuangan: Transaksi ganda, nilai tidak wajar.
    2. Deteksi anomali Stok/Inventaris: 
       - Barang dengan stok negatif (indikasi lupa catat beli).
       - Barang stok menumpuk tapi tidak ada transaksi penjualan (dead stock).
       - Margin keuntungan terlalu tipis (Harga Jual vs Harga Beli).
    3. Evaluasi Kontrol Internal: Indikasi transaksi tanpa data pelanggan/suplier yang jelas.
    4. Berikan skor risiko (0-100).
    5. Saran strategis singkat.

    Data:
    ${dataContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: riskResponseSchema,
        systemInstruction: "Anda adalah asisten kepatuhan UMKM yang teliti.",
      },
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return {
        ...result,
        lastUpdated: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error analyzing risks:", error);
    throw error;
  }
};

export const getStrategicRecommendations = async (summary: any): Promise<string> => {
    if (!apiKey) return "API Key missing. Cannot generate recommendations.";
    
    try {
        const prompt = `
        Ringkasan Keuangan:
        Pendapatan: Rp ${summary.totalIncome}
        Laba Bersih: Rp ${summary.netProfit}

        Berikan 3 rekomendasi strategis singkat (Markdown) untuk meningkatkan efisiensi operasional dan literasi digital UMKM ini.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Tidak dapat menghasilkan rekomendasi.";

    } catch (e) {
        console.error(e);
        return "Terjadi kesalahan saat menghubungi AI.";
    }
}