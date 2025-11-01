import { Transaction, CardType } from '../types';
import { CREDIT_CARDS } from '../constants/creditCards';

interface OptimizationSuggestion {
  type: 'card_switch' | 'category_switch' | 'cap_warning' | 'unused_category';
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
}

export const generateOptimizationSuggestions = (
  transactions: Transaction[],
  currentCycle: { start: Date; end: Date }
): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];

  // Analyze transaction patterns
  const categorySpending = new Map<string, { amount: number; cashback: number }>();
  
  transactions.forEach(txn => {
    const key = `${txn.cardType}_${txn.category}`;
    const existing = categorySpending.get(key) || { amount: 0, cashback: 0 };
    categorySpending.set(key, {
      amount: existing.amount + txn.amount,
      cashback: existing.cashback + txn.cashbackEarned,
    });
  });

  // Find categories approaching cap
  categorySpending.forEach((data, key) => {
    const [cardType, categoryId] = key.split('_');
    const cardConfig = CREDIT_CARDS[cardType as CardType];
    const category = cardConfig.categories.find(c => c.id === categoryId);
    
    if (category && category.capAmount) {
      const utilization = (data.cashback / category.capAmount) * 100;
      
      if (utilization > 80 && utilization < 100) {
        suggestions.push({
          type: 'cap_warning',
          title: `${category.name} nearing cap`,
          description: `You've used ${utilization.toFixed(0)}% of your ₹${category.capAmount} cap. Consider alternative categories.`,
          potentialSavings: 0,
          priority: 'high',
        });
      }
    }
  });

  // Find unused high-value categories
  Object.values(CREDIT_CARDS).forEach(card => {
    card.categories.forEach(category => {
      const key = `${card.id}_${category.id}`;
      if (!categorySpending.has(key) && category.cashbackRate >= 5) {
        suggestions.push({
          type: 'unused_category',
          title: `Unused ${category.cashbackRate}% cashback category`,
          description: `${category.name} on ${card.name} offers ${category.cashbackRate}% cashback but hasn't been used.`,
          potentialSavings: 0,
          priority: 'medium',
        });
      }
    });
  });

  // Sort by priority
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};