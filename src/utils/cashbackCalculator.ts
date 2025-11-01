import { Transaction, CardType, CashbackSummary, CategoryBreakdown } from '../types';
import { CREDIT_CARDS, getCategoryConfig } from '../constants/creditCards';
import { isDateInCycle } from './dateUtils';
import { CycleDateRange } from '../types';

export const calculateCashback = (
  amount: number,
  cardType: CardType,
  categoryId: string,
  existingTransactions: Transaction[],
  cycleRange: CycleDateRange
): { cashbackEarned: number; capReached: boolean; remainingCap: number | null } => {
  const categoryConfig = getCategoryConfig(cardType, categoryId);
  
  if (!categoryConfig) {
    return { cashbackEarned: 0, capReached: false, remainingCap: null };
  }

  const { cashbackRate, capAmount, capPeriod } = categoryConfig;
  
  // Calculate potential cashback
  let potentialCashback = (amount * cashbackRate) / 100;

  // If no cap, return the full cashback
  if (capPeriod === 'UNLIMITED' || capAmount === null) {
    return { 
      cashbackEarned: potentialCashback, 
      capReached: false, 
      remainingCap: null 
    };
  }

  // Calculate existing cashback for this category in the current period
  const existingCashback = existingTransactions
    .filter(t => 
      t.cardType === cardType && 
      t.category === categoryId && 
      isDateInCycle(t.date, cycleRange)
    )
    .reduce((sum, t) => sum + t.cashbackEarned, 0);

  // Check if cap is already reached
  if (existingCashback >= capAmount) {
    return { 
      cashbackEarned: 0, 
      capReached: true, 
      remainingCap: 0 
    };
  }

  // Calculate actual cashback considering the cap
  const remainingCap = capAmount - existingCashback;
  const actualCashback = Math.min(potentialCashback, remainingCap);

  return {
    cashbackEarned: actualCashback,
    capReached: actualCashback < potentialCashback,
    remainingCap: remainingCap - actualCashback,
  };
};

export const getCashbackSummary = (
  transactions: Transaction[],
  cardType: CardType,
  cycleRange: CycleDateRange
): CashbackSummary => {
  const cardConfig = CREDIT_CARDS[cardType];
  const filteredTransactions = transactions.filter(
    t => t.cardType === cardType && isDateInCycle(t.date, cycleRange)
  );

  const categoryBreakdown: CategoryBreakdown[] = cardConfig.categories.map(category => {
    const categoryTransactions = filteredTransactions.filter(t => t.category === category.id);
    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const cashbackEarned = categoryTransactions.reduce((sum, t) => sum + t.cashbackEarned, 0);
    
    let capRemaining = null;
    let capUtilization = 0;

    if (category.capAmount !== null) {
      capRemaining = Math.max(0, category.capAmount - cashbackEarned);
      capUtilization = (cashbackEarned / category.capAmount) * 100;
    }

    return {
      categoryId: category.id,
      categoryName: category.name,
      spent,
      cashbackEarned,
      capLimit: category.capAmount,
      capRemaining,
      capUtilization,
      transactionCount: categoryTransactions.length,
    };
  });

  const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCashback = filteredTransactions.reduce((sum, t) => sum + t.cashbackEarned, 0);

  return {
    cardType,
    totalSpent,
    totalCashback,
    categoryBreakdown,
    cycleStart: cycleRange.start,
    cycleEnd: cycleRange.end,
  };
};

export const getOptimalCategory = (
  amount: number,
  cardType: CardType,
  existingTransactions: Transaction[],
  cycleRange: CycleDateRange
): string => {
  const cardConfig = CREDIT_CARDS[cardType];
  let maxCashback = 0;
  let optimalCategory = cardConfig.categories[0].id;

  for (const category of cardConfig.categories) {
    const { cashbackEarned } = calculateCashback(
      amount,
      cardType,
      category.id,
      existingTransactions,
      cycleRange
    );

    if (cashbackEarned > maxCashback) {
      maxCashback = cashbackEarned;
      optimalCategory = category.id;
    }
  }

  return optimalCategory;
};

export const calculateTotalCashback = (
  transactions: Transaction[],
  cycleRange?: CycleDateRange
): number => {
  const filteredTransactions = cycleRange
    ? transactions.filter(t => isDateInCycle(t.date, cycleRange))
    : transactions;

  return filteredTransactions.reduce((sum, t) => sum + t.cashbackEarned, 0);
};

export const getCapWarnings = (
  cardType: CardType,
  categoryId: string,
  existingTransactions: Transaction[],
  cycleRange: CycleDateRange,
  warningThreshold: number = 80
): { isWarning: boolean; message: string | null; percentage: number } => {
  const categoryConfig = getCategoryConfig(cardType, categoryId);
  
  if (!categoryConfig || categoryConfig.capAmount === null) {
    return { isWarning: false, message: null, percentage: 0 };
  }

  const existingCashback = existingTransactions
    .filter(t => 
      t.cardType === cardType && 
      t.category === categoryId && 
      isDateInCycle(t.date, cycleRange)
    )
    .reduce((sum, t) => sum + t.cashbackEarned, 0);

  const percentage = (existingCashback / categoryConfig.capAmount) * 100;

  if (percentage >= 100) {
    return { 
      isWarning: true, 
      message: `Cap reached for ${categoryConfig.name}`, 
      percentage: 100 
    };
  }

  if (percentage >= warningThreshold) {
    return { 
      isWarning: true, 
      message: `${percentage.toFixed(0)}% of cap used for ${categoryConfig.name}`, 
      percentage 
    };
  }

  return { isWarning: false, message: null, percentage };
};