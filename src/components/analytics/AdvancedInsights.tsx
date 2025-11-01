import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb as InsightIcon,
} from '@mui/icons-material';
import { Transaction } from '../../types';
import { generateOptimizationSuggestions } from '../../utils/optimization';

interface AdvancedInsightsProps {
  transactions: Transaction[];
  cycleRange: { start: Date; end: Date };
}

const AdvancedInsights: React.FC<AdvancedInsightsProps> = ({
  transactions,
  cycleRange,
}) => {
  const insights = useMemo(() => {
    return generateOptimizationSuggestions(transactions, cycleRange);
  }, [transactions, cycleRange]);

  const spendingTrends = useMemo(() => {
    // Calculate week-over-week trends
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekSpend = transactions
      .filter(t => t.date >= lastWeek)
      .reduce((sum, t) => sum + t.amount, 0);

    const lastWeekSpend = transactions
      .filter(t => t.date >= twoWeeksAgo && t.date < lastWeek)
      .reduce((sum, t) => sum + t.amount, 0);

    const change = lastWeekSpend > 0 
      ? ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100 
      : 0;

    return {
      thisWeek: thisWeekSpend,
      lastWeek: lastWeekSpend,
      change,
      trend: change > 0 ? 'up' : 'down',
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Spending Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <InsightIcon /> Spending Insights
          </h3>
          
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold">₹{spendingTrends.thisWeek.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {spendingTrends.trend === 'up' ? (
                <TrendingUpIcon className="text-red-500" />
              ) : (
                <TrendingDownIcon className="text-green-500" />
              )}
              <span className={`font-semibold ${
                spendingTrends.trend === 'up' ? 'text-red-500' : 'text-green-500'
              }`}>
                {Math.abs(spendingTrends.change).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-600">vs last week</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Optimization Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Optimization Suggestions</h3>
          
          <div className="space-y-3">
            {insights.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <Chip
                    label={suggestion.priority}
                    size="small"
                    color={
                      suggestion.priority === 'high' ? 'error' :
                      suggestion.priority === 'medium' ? 'warning' :
                      'default'
                    }
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {suggestion.description}
                </p>
              </motion.div>
            ))}
            
            {insights.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No suggestions at this time. You're doing great! 🎉
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdvancedInsights;