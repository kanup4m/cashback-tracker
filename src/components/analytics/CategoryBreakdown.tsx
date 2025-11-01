import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { CashbackSummary, CardType } from '../../types';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { Category as CategoryIcon } from '@mui/icons-material';
import { CREDIT_CARDS } from '../../constants/creditCards';

interface CategoryBreakdownProps {
  summary?: CashbackSummary;
  cardType?: CardType;
  detailed?: boolean;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  summary,
  cardType,
  detailed = false,
}) => {
  // If no summary provided, show combined data for both cards
  const getCombinedData = () => {
    if (summary) return summary.categoryBreakdown;
    
    // This would need to be implemented to combine data from both cards
    // For now, return empty array
    return [];
  };

  const categoryData = getCombinedData();
  const totalCashback = categoryData.reduce((sum, cat) => sum + cat.cashbackEarned, 0);

  const getCategoryDetails = (categoryId: string) => {
if (!cardType || cardType === 'ALL' as any) return null;
    const card = CREDIT_CARDS[cardType as CardType];
    return card.categories.find(c => c.id === categoryId);
  };

  const getStatusChip = (utilization: number) => {
    if (utilization >= 100) {
      return <Chip label="Cap Reached" size="small" color="error" />;
    } else if (utilization >= 80) {
      return <Chip label={`${utilization.toFixed(0)}% Used`} size="small" color="warning" />;
    } else if (utilization >= 50) {
      return <Chip label={`${utilization.toFixed(0)}% Used`} size="small" color="info" />;
    }
    return <Chip label={`${utilization.toFixed(0)}% Used`} size="small" color="success" />;
  };

  if (!detailed) {
    // Simple view for dashboard
    return (
      <Card
        title="Category Performance"
        subtitle={cardType ? CREDIT_CARDS[cardType]?.name : 'All Cards'}
        icon={<CategoryIcon />}
      >
        <div className="space-y-4">
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No transactions in this period
            </div>
          ) : (
            categoryData.map((category) => {
              const details = getCategoryDetails(category.categoryId);
              const cashbackRate = details?.cashbackRate || 
                (category.spent > 0 ? (category.cashbackEarned / category.spent) * 100 : 0);
              
              return (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {category.categoryName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.transactionCount} transactions • {cashbackRate.toFixed(1)}% rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        ₹{category.cashbackEarned.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        from ₹{category.spent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {category.capLimit !== null && (
                    <ProgressBar
                      value={category.cashbackEarned}
                      max={category.capLimit}
                      height="sm"
                      color={category.capUtilization >= 100 ? 'error' : 
                             category.capUtilization >= 80 ? 'warning' : 'success'}
                      showPercentage={true}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        {categoryData.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Cashback
              </span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ₹{totalCashback.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Detailed table view
  return (
    <Card
      title="Detailed Category Breakdown"
      subtitle={cardType ? CREDIT_CARDS[cardType]?.name : 'All Cards'}
      icon={<CategoryIcon />}
    >
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Transactions</TableCell>
              <TableCell align="right">Total Spent</TableCell>
              <TableCell align="right">Cashback Rate</TableCell>
              <TableCell align="right">Cashback Earned</TableCell>
              <TableCell align="center">Cap Status</TableCell>
              <TableCell align="right">Cap Remaining</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoryData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" className="py-8">
                  <span className="text-gray-500 dark:text-gray-400">
                    No transactions in this period
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              categoryData.map((category) => {
                const details = getCategoryDetails(category.categoryId);
                const cashbackRate = details?.cashbackRate || 
                  (category.spent > 0 ? (category.cashbackEarned / category.spent) * 100 : 0);
                
                return (
                  <TableRow key={category.categoryId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{category.categoryName}</p>
                        {details?.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {details.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="right">{category.transactionCount}</TableCell>
                    <TableCell align="right">₹{category.spent.toFixed(2)}</TableCell>
                    <TableCell align="right">{cashbackRate.toFixed(2)}%</TableCell>
                    <TableCell align="right">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ₹{category.cashbackEarned.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      {category.capLimit !== null ? (
                        getStatusChip(category.capUtilization)
                      ) : (
                        <Chip label="Unlimited" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {category.capRemaining !== null ? (
                        <span className={category.capRemaining === 0 ? 'text-red-500' : ''}>
                          ₹{category.capRemaining.toFixed(2)}
                        </span>
                      ) : (
                        '∞'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            
            {/* Total Row */}
            {categoryData.length > 0 && (
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{categoryData.reduce((sum, cat) => sum + cat.transactionCount, 0)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>₹{categoryData.reduce((sum, cat) => sum + cat.spent, 0).toFixed(2)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    {categoryData.reduce((sum, cat) => sum + cat.spent, 0) > 0
                      ? ((totalCashback / categoryData.reduce((sum, cat) => sum + cat.spent, 0)) * 100).toFixed(2)
                      : '0.00'}%
                  </strong>
                </TableCell>
                <TableCell align="right">
                  <strong className="text-green-600 dark:text-green-400">
                    ₹{totalCashback.toFixed(2)}
                  </strong>
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default CategoryBreakdown;