import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { CashbackSummary, CardType } from '../../types';
import { CREDIT_CARDS } from '../../constants/creditCards';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import Button from '../common/Button';
import { Tooltip } from '@mui/material';
import EmptyState from '../common/EmptyState';

interface CategoryBreakdownCardProps {
  summary: CashbackSummary | null | undefined;
  cardType: CardType;
  showAllCategories?: boolean;
}

const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  summary,
  cardType,
  showAllCategories = false,
}) => {
  const navigate = useNavigate();
  const cardConfig = CREDIT_CARDS[cardType];

  // Handle null/undefined summary
  if (!summary || !summary.categoryBreakdown) {
    return (
      <Card
        title="Category Performance"
        subtitle={cardConfig.name}
        icon={<CategoryIcon />}
      >
        <EmptyState
          type="analytics"
          title="No Data Available"
          message="Add transactions to see category breakdown"
        />
      </Card>
    );
  }

  // Sort categories by cashback earned (descending)
  const sortedCategories = [...summary.categoryBreakdown]
    .sort((a, b) => b.cashbackEarned - a.cashbackEarned)
    .slice(0, showAllCategories ? undefined : 4); // Show top 4 by default

  const totalCashback = summary.totalCashback;

  const getCategoryPercentage = (categoryEarned: number) => {
    return totalCashback > 0 ? (categoryEarned / totalCashback) * 100 : 0;
  };

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, string> = {
      airtel_recharge: '📱',
      utility_bills: '💡',
      food_grocery: '🛒',
      myntra: '👗',
      flipkart: '🛍️',
      cleartrip: '✈️',
      preferred_merchants: '⭐',
      other_spends: '💳',
      other_transactions: '💳',
    };
    return icons[categoryId] || '📊';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 100) return 'text-red-600 dark:text-red-400';
    if (utilization >= 80) return 'text-orange-600 dark:text-orange-400';
    if (utilization >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <Card
      title="Category Performance"
      subtitle={cardConfig.name}
      icon={<CategoryIcon />}
      headerAction={
        <Button
          onClick={() => navigate('/analytics')}
          variant="ghost"
          size="sm"
          icon={<ArrowForwardIcon fontSize="small" />}
        >
          Details
        </Button>
      }
    >
      <div className="space-y-4">
        {sortedCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No transactions in this cycle
          </div>
        ) : (
          sortedCategories.map((category) => {
            const percentage = getCategoryPercentage(category.cashbackEarned);
            const categoryConfig = cardConfig.categories.find(c => c.id === category.categoryId);

            return (
              <div key={category.categoryId} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{getCategoryIcon(category.categoryId)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {category.categoryName}
                        </span>
                        <Tooltip title={`${categoryConfig?.cashbackRate}% cashback rate`}>
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {categoryConfig?.cashbackRate}%
                          </span>
                        </Tooltip>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''} • 
                        ₹{category.spent.toFixed(2)} spent
                      </div>
                    </div>
                  </div>

                  {/* Cashback Amount */}
                  <div className="text-right ml-4">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      ₹{category.cashbackEarned.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {percentage.toFixed(0)}% of total
                    </div>
                  </div>
                </div>

                {/* Progress Bar - Only show if category has a cap */}
                {category.capLimit !== null && (
                  <div>
                    <ProgressBar
                      value={category.cashbackEarned}
                      max={category.capLimit}
                      height="sm"
                      color={
                        category.capUtilization >= 100 ? 'error' :
                        category.capUtilization >= 80 ? 'warning' :
                        'success'
                      }
                      showPercentage={false}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Cap: ₹{category.capLimit}
                      </span>
                      <span className={`text-xs font-medium ${getUtilizationColor(category.capUtilization)}`}>
                        {category.capRemaining !== null && category.capRemaining > 0
                          ? `₹${category.capRemaining.toFixed(2)} remaining`
                          : 'Cap reached'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Unlimited category indicator */}
                {category.capLimit === null && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <TrendingUpIcon fontSize="small" />
                    <span>Unlimited cashback</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Total Summary */}
      {sortedCategories.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cashback</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {summary.categoryBreakdown.reduce((sum, cat) => sum + cat.transactionCount, 0)} transactions
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{totalCashback.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                from ₹{summary.totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show more button if categories are hidden */}
      {!showAllCategories && summary.categoryBreakdown.length > 4 && (
        <div className="mt-4 text-center">
          <Button
            onClick={() => navigate('/analytics')}
            variant="outline"
            size="sm"
            fullWidth
          >
            View All {summary.categoryBreakdown.length} Categories
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CategoryBreakdownCard;