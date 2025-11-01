import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt as ReceiptIcon,
  ArrowForward as ArrowForwardIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { Transaction, CycleDateRange } from '../../types';
import { useTransactions } from '../../contexts/TransactionContext';
import { isDateInCycle } from '../../utils/dateUtils';
import { CREDIT_CARDS } from '../../constants/creditCards';
import Card from '../common/Card';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { format } from 'date-fns';

interface RecentTransactionsProps {
  cycleRange: CycleDateRange;
  limit?: number;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  cycleRange, 
  limit = 5 
}) => {
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  // Filter and sort transactions
  const recentTransactions = transactions
    .filter(t => isDateInCycle(t.date, cycleRange))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  const getCardColor = (cardType: string) => {
    return cardType === 'AXIS_AIRTEL' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800';
  };

  const getCardName = (cardType: string) => {
    return cardType === 'AXIS_AIRTEL' ? 'Airtel' : 'Flipkart';
  };

  const getCategoryName = (transaction: Transaction) => {
    const cardConfig = CREDIT_CARDS[transaction.cardType];
    const category = cardConfig.categories.find(c => c.id === transaction.category);
    return category?.name || transaction.category;
  };

  return (
    <Card
      title="Recent Transactions"
      subtitle={`Last ${limit} transactions this cycle`}
      icon={<ReceiptIcon />}
      headerAction={
        <Button
          onClick={() => navigate('/transactions')}
          variant="ghost"
          size="sm"
          icon={<ArrowForwardIcon fontSize="small" />}
        >
          View All
        </Button>
      }
    >
      {recentTransactions.length === 0 ? (
        <EmptyState
          type="transactions"
          title="No Recent Transactions"
          message="Add your first transaction to start tracking cashback"
          onAction={() => navigate('/transactions')}
          actionLabel="Add Transaction"
        />
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => navigate('/transactions')}
            >
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg ${getCardColor(transaction.cardType)}`}>
                  <CreditCardIcon fontSize="small" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {getCategoryName(transaction)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCardColor(transaction.cardType)}`}>
                      {getCardName(transaction.cardType)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>{format(transaction.date, 'MMM dd, yyyy')}</span>
                    {transaction.description && (
                      <>
                        <span>•</span>
                        <span className="truncate">{transaction.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="text-right ml-4">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  ₹{transaction.amount.toFixed(2)}
                </div>
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  +₹{transaction.cashbackEarned.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {recentTransactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total from {recentTransactions.length} transactions
            </span>
            <div className="flex items-center gap-4">
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                ₹{recentTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </span>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                +₹{recentTransactions.reduce((sum, t) => sum + t.cashbackEarned, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentTransactions;