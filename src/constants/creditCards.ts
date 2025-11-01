import { CreditCardConfig, CardType } from '../types';

export const CREDIT_CARDS: Record<CardType, CreditCardConfig> = {
  AXIS_AIRTEL: {
    id: 'AXIS_AIRTEL',
    name: 'Axis Airtel Credit Card',
    color: '#FF9800',
    categories: [
      {
        id: 'airtel_recharge',
        name: 'Airtel Recharge/Bill',
        description: 'Mobile, Broadband, WiFi, DTH via Airtel Thanks app',
        cashbackRate: 25,
        capAmount: 250,
        capPeriod: 'MONTHLY',
      },
      {
        id: 'utility_bills',
        name: 'Utility Bills',
        description: 'Electricity, Water, Gas via Airtel Thanks app',
        cashbackRate: 10,
        capAmount: 250,
        capPeriod: 'MONTHLY',
      },
      {
        id: 'food_grocery',
        name: 'Zomato/Swiggy/BigBasket',
        description: 'Food delivery and grocery',
        cashbackRate: 10,
        capAmount: 500,
        capPeriod: 'MONTHLY',
      },
      {
        id: 'other_spends',
        name: 'Other Spends',
        description: 'All other eligible transactions',
        cashbackRate: 1,
        capAmount: null,
        capPeriod: 'UNLIMITED',
      },
    ],
  },
  FLIPKART_AXIS: {
    id: 'FLIPKART_AXIS',
    name: 'Flipkart Axis Credit Card',
    color: '#9C27B0',
    categories: [
      {
        id: 'myntra',
        name: 'Myntra',
        description: 'Fashion and lifestyle shopping',
        cashbackRate: 7.5,
        capAmount: 4000,
        capPeriod: 'QUARTERLY',
      },
      {
        id: 'flipkart',
        name: 'Flipkart',
        description: 'E-commerce purchases',
        cashbackRate: 5,
        capAmount: 4000,
        capPeriod: 'QUARTERLY',
      },
      {
        id: 'cleartrip',
        name: 'Cleartrip',
        description: 'Travel bookings',
        cashbackRate: 5,
        capAmount: 4000,
        capPeriod: 'QUARTERLY',
      },
      {
        id: 'preferred_merchants',
        name: 'Preferred Merchants',
        description: 'cult.fit, PVR, Swiggy, Uber',
        cashbackRate: 4,
        capAmount: null,
        capPeriod: 'UNLIMITED',
      },
      {
        id: 'other_transactions',
        name: 'Other Transactions',
        description: 'All other eligible transactions',
        cashbackRate: 1,
        capAmount: null,
        capPeriod: 'UNLIMITED',
      },
    ],
  },
};

export const getCardConfig = (cardType: CardType): CreditCardConfig => {
  return CREDIT_CARDS[cardType];
};

export const getCategoryConfig = (cardType: CardType, categoryId: string) => {
  const card = CREDIT_CARDS[cardType];
  return card.categories.find(cat => cat.id === categoryId);
};

export const QUARTERS = {
  Q1: { start: 0, end: 2, label: 'Q1 (Jan-Mar)' },
  Q2: { start: 3, end: 5, label: 'Q2 (Apr-Jun)' },
  Q3: { start: 6, end: 8, label: 'Q3 (Jul-Sep)' },
  Q4: { start: 9, end: 11, label: 'Q4 (Oct-Dec)' },
};

export const getCurrentQuarter = (date: Date = new Date()) => {
  const month = date.getMonth();
  if (month <= 2) return 'Q1';
  if (month <= 5) return 'Q2';
  if (month <= 8) return 'Q3';
  return 'Q4';
};