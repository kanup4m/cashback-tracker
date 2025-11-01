import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Transaction,
  CardType,
  CycleDateRange,
  FilterOptions,
  CashbackSummary,
  DashboardStats,
} from '../types';
import {
  saveTransactions,
  loadTransactions,
  addTransaction as addToStorage,
  updateTransaction as updateInStorage,
  deleteTransaction as deleteFromStorage,
} from '../utils/storage';
import { 
  calculateCashback, 
  getCashbackSummary, 
  calculateTotalCashback 
} from '../utils/cashbackCalculator';
import { isDateInCycle, getCycleRange } from '../utils/dateUtils'; // Add getCycleRange import
import { getCategoryConfig } from '../constants/creditCards'; // Add this import
import { NotificationService } from '../services/notificationService'; // Add this import

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getFilteredTransactions: (filters: FilterOptions) => Transaction[];
  getCashbackSummary: (cardType: CardType, cycleRange: CycleDateRange) => CashbackSummary;
  getDashboardStats: (cycleRange: CycleDateRange) => DashboardStats;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions on mount
  useEffect(() => {
    refreshTransactions();
  }, []);

  const refreshTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTransactions = await loadTransactions();
      setTransactions(loadedTransactions);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newTransaction: Transaction = {
        ...transactionData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addToStorage(newTransaction);
      setTransactions(prev => [...prev, newTransaction]);

      // Check for cap warnings
      const cycleRange = getCycleRange('STATEMENT'); // Now works with import
      const { capReached, remainingCap } = calculateCashback(
        newTransaction.amount,
        newTransaction.cardType,
        newTransaction.category,
        transactions,
        cycleRange
      );

      if (capReached && remainingCap !== null && remainingCap < 50) {
        const categoryConfig = getCategoryConfig(newTransaction.cardType, newTransaction.category); // Now works with import
        if (categoryConfig && categoryConfig.capAmount) {
          const utilization = ((categoryConfig.capAmount - remainingCap) / categoryConfig.capAmount) * 100;
          NotificationService.getInstance().showCapWarning(categoryConfig.name, utilization);
        }
      }
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await updateInStorage(id, updates);
      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t))
      );
    } catch (err) {
      setError('Failed to update transaction');
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteFromStorage(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const getFilteredTransactions = (filters: FilterOptions): Transaction[] => {
    let filtered = [...transactions];

    if (filters.cardType) {
      filtered = filtered.filter(t => t.cardType === filters.cardType);
    }

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters.dateRange) {
      filtered = filtered.filter(t =>
        t.date >= filters.dateRange!.start && t.date <= filters.dateRange!.end
      );
    }

    if (filters.amountRange) {
      filtered = filtered.filter(t =>
        t.amount >= filters.amountRange!.min && t.amount <= filters.amountRange!.max
      );
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchLower) ||
        t.merchant?.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getCashbackSummaryForCard = (
    cardType: CardType,
    cycleRange: CycleDateRange
  ): CashbackSummary => {
    return getCashbackSummary(transactions, cardType, cycleRange);
  };

  const getDashboardStats = (cycleRange: CycleDateRange): DashboardStats => {
    const cycleTransactions = transactions.filter(t => isDateInCycle(t.date, cycleRange));
    
    const totalCashback = cycleTransactions.reduce((sum, t) => sum + t.cashbackEarned, 0);
    const totalSpent = cycleTransactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = cycleTransactions.length;
    const averageCashback = transactionCount > 0 ? totalCashback / transactionCount : 0;

    // Find top category
    const categoryMap = new Map<string, number>();
    cycleTransactions.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });
    const topCategory = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Calculate cycle progress
    const now = new Date();
    const totalDays = Math.ceil(
      (cycleRange.end.getTime() - cycleRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysPassed = Math.ceil(
      (now.getTime() - cycleRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const cycleProgress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    return {
      totalCashback,
      totalSpent,
      transactionCount,
      averageCashback,
      topCategory,
      cycleProgress,
    };
  };

  const value: TransactionContextType = {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    getCashbackSummary: getCashbackSummaryForCard,
    getDashboardStats,
    refreshTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};