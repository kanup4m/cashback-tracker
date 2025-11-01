import localforage from 'localforage';
import { Transaction, Settings, ExportData } from '../types';


// Configure localforage
localforage.config({
  name: 'CashbackTracker',
  storeName: 'cashback_data',
  description: 'Cashback Tracker Application Data',
});

// Keys for storage
const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings',
  LAST_BACKUP: 'last_backup',
  CYCLE_PREFERENCE: 'cycle_preference',
};

// Transaction Storage
export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    await localforage.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactions = await localforage.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
    if (!transactions) return [];
    
    // Convert date strings back to Date objects
    return transactions.map(t => ({
      ...t,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
  const transactions = await loadTransactions();
  transactions.push(transaction);
  await saveTransactions(transactions);
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
  const transactions = await loadTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index !== -1) {
    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date(),
    };
    await saveTransactions(transactions);
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const transactions = await loadTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  await saveTransactions(filtered);
};

// Settings Storage
export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await localforage.setItem(STORAGE_KEYS.SETTINGS, settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const loadSettings = async (): Promise<Settings | null> => {
  try {
    const settings = await localforage.getItem<Settings>(STORAGE_KEYS.SETTINGS);
    return settings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
};

export const getDefaultSettings = (): Settings => {
  return {
    defaultCycle: 'STATEMENT',
    statementCycleDate: 12,
    dateFormat: 'DD/MM/YYYY',
    currency: '₹',
    theme: 'light', // Changed from 'light' to ensure it starts in light mode
    notifications: {
      capWarning: true,
      capWarningThreshold: 80,
      dailySummary: false,
      weeklySummary: false,
      cycleReset: true,
    },
  };
};

// Export/Import Functions
export const exportData = async (): Promise<ExportData> => {
  const transactions = await loadTransactions();
  const settings = await loadSettings() || getDefaultSettings();

  return {
    version: '1.0.0',
    exportDate: new Date(),
    transactions,
    settings,
  };
};

export const importData = async (data: ExportData): Promise<void> => {
  try {
    // Validate data structure
    if (!data.version || !data.transactions || !data.settings) {
      throw new Error('Invalid import data format');
    }

    // Import transactions
    await saveTransactions(data.transactions);

    // Import settings
    await saveSettings(data.settings);
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

export const exportToJSON = async (): Promise<string> => {
  const data = await exportData();
  return JSON.stringify(data, null, 2);
};

export const exportToCSV = async (): Promise<string> => {
  const transactions = await loadTransactions();
  
  const headers = [
    'Date',
    'Card',
    'Category',
    'Amount',
    'Cashback Rate',
    'Cashback Earned',
    'Description',
    'Merchant',
  ];

  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.cardType,
    t.category,
    t.amount.toFixed(2),
    `${t.cashbackRate}%`,
    t.cashbackEarned.toFixed(2),
    t.description || '',
    t.merchant || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// Clear Data Functions
export const clearAllData = async (): Promise<void> => {
  try {
    await localforage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

export const clearTransactions = async (): Promise<void> => {
  try {
    await localforage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  } catch (error) {
    console.error('Error clearing transactions:', error);
    throw error;
  }
};

// Backup Functions
export const createBackup = async (): Promise<void> => {
  const data = await exportData();
  const backupKey = `backup_${Date.now()}`;
  await localforage.setItem(backupKey, data);
  await localforage.setItem(STORAGE_KEYS.LAST_BACKUP, backupKey);
};

export const restoreFromBackup = async (): Promise<boolean> => {
  try {
    const lastBackupKey = await localforage.getItem<string>(STORAGE_KEYS.LAST_BACKUP);
    if (!lastBackupKey) return false;

    const backupData = await localforage.getItem<ExportData>(lastBackupKey);
    if (!backupData) return false;

    await importData(backupData);
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return false;
  }
};


export type { ExportData } from '../types';