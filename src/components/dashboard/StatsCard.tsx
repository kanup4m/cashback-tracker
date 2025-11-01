import React from 'react';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  Percent as PercentIcon,
  ShoppingCart as ShoppingIcon,
} from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: 'cashback' | 'spent' | 'transactions' | 'percentage';
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  icon,
  color,
  subtitle,
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'cashback':
        return <MoneyIcon />;
      case 'spent':
        return <ShoppingIcon />;
      case 'transactions':
        return <ReceiptIcon />;
      case 'percentage':
        return <PercentIcon />;
      default:
        return <MoneyIcon />;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          icon: 'text-purple-600 dark:text-purple-400',
          trend: 'text-purple-600 dark:text-purple-400',
        };
      case 'secondary':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          icon: 'text-orange-600 dark:text-orange-400',
          trend: 'text-orange-600 dark:text-orange-400',
        };
      case 'success':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          icon: 'text-green-600 dark:text-green-400',
          trend: 'text-green-600 dark:text-green-400',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          icon: 'text-yellow-600 dark:text-yellow-400',
          trend: 'text-yellow-600 dark:text-yellow-400',
        };
      case 'info':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          icon: 'text-blue-600 dark:text-blue-400',
          trend: 'text-blue-600 dark:text-blue-400',
        };
      case 'error':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          icon: 'text-red-600 dark:text-red-400',
          trend: 'text-red-600 dark:text-red-400',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/30',
          icon: 'text-gray-600 dark:text-gray-400',
          trend: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const colors = getColorClasses();
  const isPositiveTrend = trend && trend > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {value}
          </p>
          
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
          
          {trend !== undefined && (
            <div className={`flex items-center mt-2 ${colors.trend}`}>
              {isPositiveTrend ? (
                <TrendingUpIcon fontSize="small" />
              ) : (
                <TrendingDownIcon fontSize="small" />
              )}
              <span className="text-sm font-medium ml-1">
                {Math.abs(trend)}%
              </span>
              <span className="text-xs ml-1 text-gray-500">
                vs last cycle
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <span className={colors.icon}>
            {getIcon()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;