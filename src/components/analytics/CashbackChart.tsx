import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Transaction, CardType, CycleDateRange } from '../../types';
import { isDateInCycle } from '../../utils/dateUtils';
import Card from '../common/Card';
import { PieChart as PieChartIcon } from '@mui/icons-material';

interface CashbackChartProps {
  transactions: Transaction[];
  cycleRange: CycleDateRange;
  cardFilter?: CardType;
  chartType?: 'pie' | 'bar';
}

const COLORS = {
  AXIS_AIRTEL: {
    airtel_recharge: '#FF6B6B',
    utility_bills: '#4ECDC4',
    food_grocery: '#45B7D1',
    other_spends: '#96CEB4',
  },
  FLIPKART_AXIS: {
    myntra: '#9B59B6',
    flipkart: '#3498DB',
    cleartrip: '#E74C3C',
    preferred_merchants: '#F39C12',
    other_transactions: '#95A5A6',
  },
};

const CashbackChart: React.FC<CashbackChartProps> = ({
  transactions,
  cycleRange,
  cardFilter,
  chartType = 'pie',
}) => {
  const chartData = useMemo(() => {
    // Filter transactions by cycle and card
    const filteredTransactions = transactions.filter(t => {
      const inCycle = isDateInCycle(t.date, cycleRange);
      const matchesCard = !cardFilter || t.cardType === cardFilter;
      return inCycle && matchesCard;
    });

    // Group by category
    const categoryMap = new Map<string, { amount: number; cashback: number; card: CardType }>();
    
    filteredTransactions.forEach(t => {
      const key = `${t.cardType}_${t.category}`;
      const existing = categoryMap.get(key) || { amount: 0, cashback: 0, card: t.cardType };
      categoryMap.set(key, {
        amount: existing.amount + t.amount,
        cashback: existing.cashback + t.cashbackEarned,
        card: t.cardType,
      });
    });

    // Convert to chart data format
    return Array.from(categoryMap.entries()).map(([key, value]) => {
      const [cardType, category] = key.split('_');
      const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        name: categoryName,
        value: value.cashback,
        amount: value.amount,
        card: value.card,
        category,
        color: (COLORS[value.card as CardType] as Record<string, string>)?.[category] || '#95A5A6',
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, cycleRange, cardFilter]);

  const totalCashback = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cashback: ₹{data.value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Spent: ₹{data.amount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rate: {((data.value / data.amount) * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: any) => `₹${entry.value.toFixed(0)}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry: any) => (
  <span style={{ color: entry?.color }}>
    {value} ({((entry?.payload?.value / totalCashback) * 100).toFixed(1)}%)
  </span>
)}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="#8884d8">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  if (chartData.length === 0) {
    return (
      <Card
        title="Cashback Distribution"
        icon={<PieChartIcon />}
      >
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available for the selected period
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Cashback Distribution"
      subtitle={`Total: ₹${totalCashback.toFixed(2)}`}
      icon={<PieChartIcon />}
    >
      {chartType === 'pie' ? renderPieChart() : renderBarChart()}
      
      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {chartData.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Top Category</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {chartData[0]?.name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {chartData.length > 0 
                ? ((totalCashback / chartData.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(2)
                : '0.00'}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CashbackChart;