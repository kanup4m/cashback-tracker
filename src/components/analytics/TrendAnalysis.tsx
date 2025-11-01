import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Transaction, CardType, CycleType } from '../../types';
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns';
import Card from '../common/Card';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

interface TrendAnalysisProps {
  transactions: Transaction[];
  cycleType: CycleType;
  cardFilter?: CardType;
}

type TimeGranularity = 'daily' | 'weekly' | 'monthly';
type ChartType = 'line' | 'area';

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  transactions,
  cycleType,
  cardFilter,
}) => {
  const [granularity, setGranularity] = useState<TimeGranularity>('daily');
  const [chartType, setChartType] = useState<ChartType>('area');

  const trendData = useMemo(() => {
    // Filter transactions by card if specified
    const filteredTransactions = cardFilter
      ? transactions.filter(t => t.cardType === cardFilter)
      : transactions;

    // Group transactions by time period
    const groupedData = new Map<string, {
      date: Date;
      spent: number;
      cashback: number;
      transactions: number;
      airtelCashback?: number;
      flipkartCashback?: number;
    }>();

    filteredTransactions.forEach(transaction => {
      let periodKey: string;
      let periodStart: Date;

      switch (granularity) {
        case 'daily':
          periodStart = startOfDay(transaction.date);
          periodKey = format(periodStart, 'yyyy-MM-dd');
          break;
        case 'weekly':
          periodStart = startOfWeek(transaction.date, { weekStartsOn: 1 });
          periodKey = format(periodStart, 'yyyy-ww');
          break;
        case 'monthly':
          periodStart = startOfMonth(transaction.date);
          periodKey = format(periodStart, 'yyyy-MM');
          break;
      }

      const existing = groupedData.get(periodKey) || {
        date: periodStart,
        spent: 0,
        cashback: 0,
        transactions: 0,
        airtelCashback: 0,
        flipkartCashback: 0,
      };

      existing.spent += transaction.amount;
      existing.cashback += transaction.cashbackEarned;
      existing.transactions += 1;

      if (transaction.cardType === 'AXIS_AIRTEL') {
        existing.airtelCashback = (existing.airtelCashback || 0) + transaction.cashbackEarned;
      } else {
        existing.flipkartCashback = (existing.flipkartCashback || 0) + transaction.cashbackEarned;
      }

      groupedData.set(periodKey, existing);
    });

    // Convert to array and sort by date
    const dataArray = Array.from(groupedData.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(item => ({
        ...item,
        dateLabel: granularity === 'daily' 
          ? format(item.date, 'MMM dd')
          : granularity === 'weekly'
          ? `Week of ${format(item.date, 'MMM dd')}`
          : format(item.date, 'MMM yyyy'),
        cashbackRate: item.spent > 0 ? (item.cashback / item.spent) * 100 : 0,
      }));

    return dataArray;
  }, [transactions, granularity, cardFilter]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (trendData.length < 2) return null;

    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));

    const firstHalfCashback = firstHalf.reduce((sum, item) => sum + item.cashback, 0);
    const secondHalfCashback = secondHalf.reduce((sum, item) => sum + item.cashback, 0);

    const trend = secondHalfCashback > firstHalfCashback ? 'up' : 'down';
    const trendPercentage = firstHalfCashback > 0
      ? ((secondHalfCashback - firstHalfCashback) / firstHalfCashback) * 100
      : 0;

    const avgDailyCashback = trendData.reduce((sum, item) => sum + item.cashback, 0) / trendData.length;
    const maxCashbackDay = trendData.reduce((max, item) => 
      item.cashback > max.cashback ? item : max, trendData[0]);

    return {
      trend,
      trendPercentage,
      avgDailyCashback,
      maxCashbackDay,
      totalPeriods: trendData.length,
    };
  }, [trendData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toFixed(2)}
            </p>
          ))}
          {payload[0].payload.transactions && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transactions: {payload[0].payload.transactions}
            </p>
          )}
          {payload[0].payload.cashbackRate !== undefined && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rate: {payload[0].payload.cashbackRate.toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: trendData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="dateLabel" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={granularity === 'daily' ? 'preserveStartEnd' : 0}
          />
          <YAxis tickFormatter={(value) => `₹${value}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {!cardFilter && (
            <>
              <Line 
                type="monotone" 
                dataKey="airtelCashback" 
                stroke="#FF9800" 
                name="Axis Airtel"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="flipkartCashback" 
                stroke="#9C27B0" 
                name="Flipkart Axis"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </>
          )}
          <Line 
            type="monotone" 
            dataKey="cashback" 
            stroke="#4CAF50" 
            name="Total Cashback"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="dateLabel" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={granularity === 'daily' ? 'preserveStartEnd' : 0}
        />
        <YAxis tickFormatter={(value) => `₹${value}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {!cardFilter && (
          <>
            <Area 
              type="monotone" 
              dataKey="airtelCashback" 
              stackId="1"
              stroke="#FF9800" 
              fill="#FFE0B2"
              name="Axis Airtel"
            />
            <Area 
              type="monotone" 
              dataKey="flipkartCashback" 
              stackId="1"
              stroke="#9C27B0" 
              fill="#E1BEE7"
              name="Flipkart Axis"
            />
          </>
        )}
        {cardFilter && (
          <Area 
            type="monotone" 
            dataKey="cashback" 
            stroke="#4CAF50" 
            fill="#C8E6C9"
            name="Cashback"
          />
        )}
      </AreaChart>
    );
  };

  return (
    <Card
      title="Cashback Trend Analysis"
      subtitle={`${granularity.charAt(0).toUpperCase() + granularity.slice(1)} view`}
      icon={<TrendingUpIcon />}
    >
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <ToggleButtonGroup
          value={granularity}
          exclusive
          onChange={(e, value) => value && setGranularity(value)}
          size="small"
        >
          <ToggleButton value="daily">Daily</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
          <ToggleButton value="monthly">Monthly</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(e, value) => value && setChartType(value)}
          size="small"
        >
          <ToggleButton value="area">Area</ToggleButton>
          <ToggleButton value="line">Line</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* Chart */}
      {trendData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available for trend analysis
        </div>
      )}

      {/* Trend Statistics */}
      {trendStats && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Trend</p>
              <p className={`text-lg font-semibold ${
                trendStats.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendStats.trend === 'up' ? '↑' : '↓'} {Math.abs(trendStats.trendPercentage).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg {granularity}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ₹{trendStats.avgDailyCashback.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best {granularity}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ₹{trendStats.maxCashbackDay.cashback.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Data Points</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {trendStats.totalPeriods}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TrendAnalysis;