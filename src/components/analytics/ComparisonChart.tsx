import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CashbackSummary, CycleDateRange } from '../../types';
import Card from '../common/Card';
import { Compare as CompareIcon } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

interface ComparisonChartProps {
  airtelSummary: CashbackSummary;
  flipkartSummary: CashbackSummary;
  cycleRange: CycleDateRange;
}

type ChartType = 'bar' | 'radar';

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  airtelSummary,
  flipkartSummary,
  cycleRange,
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Prepare comparison data
  const comparisonData = useMemo(() => [
    {
      metric: 'Total Spent',
      Airtel: airtelSummary.totalSpent,
      Flipkart: flipkartSummary.totalSpent,
    },
    {
      metric: 'Total Cashback',
      Airtel: airtelSummary.totalCashback,
      Flipkart: flipkartSummary.totalCashback,
    },
    {
      metric: 'Avg Cashback Rate',
      Airtel: airtelSummary.totalSpent > 0 
        ? (airtelSummary.totalCashback / airtelSummary.totalSpent) * 100 
        : 0,
      Flipkart: flipkartSummary.totalSpent > 0 
        ? (flipkartSummary.totalCashback / flipkartSummary.totalSpent) * 100 
        : 0,
    },
    {
      metric: 'Transactions',
      Airtel: airtelSummary.categoryBreakdown.reduce((sum, cat) => sum + cat.transactionCount, 0),
      Flipkart: flipkartSummary.categoryBreakdown.reduce((sum, cat) => sum + cat.transactionCount, 0),
    },
  ], [airtelSummary, flipkartSummary]);

  // Prepare radar chart data - FIXED VERSION
  const radarData = useMemo(() => {
    // Create a map to combine categories from both cards
    const categoryMap = new Map<string, { category: string; Airtel: number; Flipkart: number }>();

    // Add Airtel categories
    airtelSummary.categoryBreakdown.forEach(cat => {
      categoryMap.set(cat.categoryName, {
        category: cat.categoryName,
        Airtel: cat.cashbackEarned,
        Flipkart: 0,
      });
    });

    // Add/merge Flipkart categories
    flipkartSummary.categoryBreakdown.forEach(cat => {
      const existing = categoryMap.get(cat.categoryName);
      if (existing) {
        existing.Flipkart = cat.cashbackEarned;
      } else {
        categoryMap.set(cat.categoryName, {
          category: cat.categoryName,
          Airtel: 0,
          Flipkart: cat.cashbackEarned,
        });
      }
    });

    // Convert map to array
    return Array.from(categoryMap.values());
  }, [airtelSummary, flipkartSummary]);

  // Calculate performance metrics
  const getPerformanceScore = (summary: CashbackSummary) => {
    const rate = summary.totalSpent > 0 ? (summary.totalCashback / summary.totalSpent) * 100 : 0;
    const categoriesWithCap = summary.categoryBreakdown.filter(cat => cat.capLimit);
    const utilization = categoriesWithCap.length > 0
      ? categoriesWithCap.reduce((sum, cat) => {
          return sum + (cat.cashbackEarned / (cat.capLimit || 1)) * 100;
        }, 0) / categoriesWithCap.length
      : 0;
    
    return {
      rate,
      utilization,
      efficiency: (rate * utilization) / 100,
    };
  };

  const airtelPerformance = useMemo(() => getPerformanceScore(airtelSummary), [airtelSummary]);
  const flipkartPerformance = useMemo(() => getPerformanceScore(flipkartSummary), [flipkartSummary]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                label === 'Avg Cashback Rate' 
                  ? `${entry.value.toFixed(2)}%`
                  : label === 'Transactions'
                  ? entry.value
                  : `₹${entry.value.toFixed(2)}`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={comparisonData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="metric" />
        <YAxis 
          tickFormatter={(value) => 
            comparisonData[0]?.metric === 'Avg Cashback Rate' ? `${value}%` : `₹${value}`
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Airtel" fill="#FF9800" />
        <Bar dataKey="Flipkart" fill="#9C27B0" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" />
        <PolarRadiusAxis />
        <Radar 
          name="Axis Airtel" 
          dataKey="Airtel" 
          stroke="#FF9800" 
          fill="#FF9800" 
          fillOpacity={0.6} 
        />
        <Radar 
          name="Flipkart Axis" 
          dataKey="Flipkart" 
          stroke="#9C27B0" 
          fill="#9C27B0" 
          fillOpacity={0.6} 
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );

  const winner = airtelSummary.totalCashback > flipkartSummary.totalCashback ? 'Airtel' : 'Flipkart';
  const winnerAmount = Math.abs(airtelSummary.totalCashback - flipkartSummary.totalCashback);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          gradient="airtel"
          className="text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2">Axis Airtel</h3>
              <div className="space-y-1">
                <p className="text-sm opacity-90">
                  Cashback: ₹{airtelSummary.totalCashback.toFixed(2)}
                </p>
                <p className="text-sm opacity-90">
                  Spent: ₹{airtelSummary.totalSpent.toFixed(2)}
                </p>
                <p className="text-sm opacity-90">
                  Rate: {airtelPerformance.rate.toFixed(2)}%
                </p>
                <p className="text-sm opacity-90">
                  Cap Utilization: {airtelPerformance.utilization.toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold">
              {airtelPerformance.efficiency.toFixed(0)}
            </div>
          </div>
        </Card>

        <Card
          gradient="flipkart"
          className="text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2">Flipkart Axis</h3>
              <div className="space-y-1">
                <p className="text-sm opacity-90">
                  Cashback: ₹{flipkartSummary.totalCashback.toFixed(2)}
                </p>
                <p className="text-sm opacity-90">
                  Spent: ₹{flipkartSummary.totalSpent.toFixed(2)}
                </p>
                <p className="text-sm opacity-90">
                  Rate: {flipkartPerformance.rate.toFixed(2)}%
                </p>
                <p className="text-sm opacity-90">
                  Cap Utilization: {flipkartPerformance.utilization.toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold">
              {flipkartPerformance.efficiency.toFixed(0)}
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card
        title="Card Comparison"
        subtitle={cycleRange.label}
        icon={<CompareIcon />}
        headerAction={
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, value) => value && setChartType(value)}
            size="small"
          >
            <ToggleButton value="bar">Bar</ToggleButton>
            <ToggleButton value="radar">Radar</ToggleButton>
          </ToggleButtonGroup>
        }
      >
        {chartType === 'bar' ? renderBarChart() : renderRadarChart()}

        {/* Winner Badge */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Better Performer This Cycle
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              winner === 'Airtel' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
            }`}>
              <span className="text-lg">🏆</span>
              <span className="font-semibold">
                {winner === 'Airtel' ? 'Axis Airtel' : 'Flipkart Axis'}
              </span>
              <span className="text-sm">
                (+₹{winnerAmount.toFixed(2)})
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Cashback</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ₹{(airtelSummary.totalCashback + flipkartSummary.totalCashback).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ₹{(airtelSummary.totalSpent + flipkartSummary.totalSpent).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Combined Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {((airtelSummary.totalCashback + flipkartSummary.totalCashback) / 
                (airtelSummary.totalSpent + flipkartSummary.totalSpent) * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {airtelSummary.categoryBreakdown.reduce((sum, cat) => sum + cat.transactionCount, 0) +
               flipkartSummary.categoryBreakdown.reduce((sum, cat) => sum + cat.transactionCount, 0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComparisonChart;