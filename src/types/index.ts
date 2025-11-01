// Credit Card Types
export type CardType = 'AXIS_AIRTEL' | 'FLIPKART_AXIS';

// Billing Cycle Types
export type CycleType = 'STATEMENT' | 'CALENDAR' | 'CUSTOM' | 'QUARTERLY';

// Transaction Interface
export interface Transaction {
  id: string;
  cardType: CardType;
  category: string;
  amount: number;
  cashbackRate: number;
  cashbackEarned: number;
  date: Date;
  description?: string;
  merchant?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Credit Card Configuration
export interface CreditCardConfig {
  id: CardType;
  name: string;
  icon?: string;
  color: string;
  categories: CategoryConfig[];
}

// Category Configuration
export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  cashbackRate: number;
  capAmount: number | null; // null for unlimited
  capPeriod: 'MONTHLY' | 'QUARTERLY' | 'UNLIMITED';
  icon?: string;
}

// Cashback Summary
export interface CashbackSummary {
  cardType: CardType;
  totalSpent: number;
  totalCashback: number;
  categoryBreakdown: CategoryBreakdown[];
  cycleStart: Date;
  cycleEnd: Date;
}

// Category Breakdown
export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  spent: number;
  cashbackEarned: number;
  capLimit: number | null;
  capRemaining: number | null;
  capUtilization: number;
  transactionCount: number;
}

// Settings Interface
export interface Settings {
  defaultCycle: CycleType;
  statementCycleDate: number; // 1-31
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
}

// Notification Settings
export interface NotificationSettings {
  capWarning: boolean;
  capWarningThreshold: number; // percentage
  dailySummary: boolean;
  weeklySummary: boolean;
  cycleReset: boolean;
}

// Cycle Date Range
export interface CycleDateRange {
  start: Date;
  end: Date;
  type: CycleType;
  label: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalCashback: number;
  totalSpent: number;
  transactionCount: number;
  averageCashback: number;
  topCategory: string;
  cycleProgress: number; // percentage
}

// Export Data Format
export interface ExportData {
  version: string;
  exportDate: Date;
  transactions: Transaction[];
  settings: Settings;
}

// Filter Options
export interface FilterOptions {
  cardType?: CardType;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}