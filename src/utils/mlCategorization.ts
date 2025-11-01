import { Transaction, CardType } from '../types';

interface MerchantPattern {
  keywords: string[];
  category: string;
  cardType: CardType;
}

const MERCHANT_PATTERNS: MerchantPattern[] = [
  {
    keywords: ['airtel', 'mobile recharge', 'prepaid', 'postpaid'],
    category: 'airtel_recharge',
    cardType: 'AXIS_AIRTEL',
  },
  {
    keywords: ['electricity', 'power', 'bescom', 'mseb', 'water', 'gas'],
    category: 'utility_bills',
    cardType: 'AXIS_AIRTEL',
  },
  {
    keywords: ['zomato', 'swiggy', 'bigbasket', 'food', 'grocery'],
    category: 'food_grocery',
    cardType: 'AXIS_AIRTEL',
  },
  {
    keywords: ['flipkart', 'fk', 'ekart'],
    category: 'flipkart',
    cardType: 'FLIPKART_AXIS',
  },
  {
    keywords: ['myntra', 'fashion', 'clothing'],
    category: 'myntra',
    cardType: 'FLIPKART_AXIS',
  },
  {
    keywords: ['cleartrip', 'flight', 'hotel', 'travel'],
    category: 'cleartrip',
    cardType: 'FLIPKART_AXIS',
  },
];

export const suggestCategory = (
  description: string,
  merchant?: string
): { category: string; cardType: CardType; confidence: number } | null => {
  const text = `${description} ${merchant || ''}`.toLowerCase();
  
  for (const pattern of MERCHANT_PATTERNS) {
    const matches = pattern.keywords.filter(keyword => text.includes(keyword));
    if (matches.length > 0) {
      const confidence = (matches.length / pattern.keywords.length) * 100;
      return {
        category: pattern.category,
        cardType: pattern.cardType,
        confidence,
      };
    }
  }
  
  return null;
};

export const learnFromTransaction = (transaction: Transaction) => {
  // Store merchant-category mapping in localStorage for learning
  const learningData = localStorage.getItem('merchant_learning');
  const data = learningData ? JSON.parse(learningData) : {};
  
  if (transaction.merchant) {
    data[transaction.merchant.toLowerCase()] = {
      category: transaction.category,
      cardType: transaction.cardType,
      count: (data[transaction.merchant.toLowerCase()]?.count || 0) + 1,
    };
    
    localStorage.setItem('merchant_learning', JSON.stringify(data));
  }
};

export const predictCategory = (merchant: string): { category: string; cardType: CardType } | null => {
  const learningData = localStorage.getItem('merchant_learning');
  if (!learningData) return null;
  
  const data = JSON.parse(learningData);
  const merchantData = data[merchant.toLowerCase()];
  
  if (merchantData && merchantData.count > 2) {
    return {
      category: merchantData.category,
      cardType: merchantData.cardType,
    };
  }
  
  return null;
};