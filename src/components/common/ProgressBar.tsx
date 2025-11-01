import React from 'react';
import { Tooltip } from '@mui/material';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = true,
  color = 'primary',
  height = 'md',
  animated = true,
  className = '',
}) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'bg-purple-500';
      case 'secondary':
        return 'bg-orange-500';
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'gradient':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-purple-500';
    }
  };

  const getHeightClass = () => {
    switch (height) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-3';
      case 'lg':
        return 'h-4';
      default:
        return 'h-3';
    }
  };

  const getWarningColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-orange-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return getColorClass();
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      
      <Tooltip title={`₹${value.toFixed(2)} / ₹${max.toFixed(2)}`} placement="top">
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${getHeightClass()} overflow-hidden`}>
          <div
            className={`${getWarningColor()} ${getHeightClass()} rounded-full transition-all duration-500 ease-out ${
              animated ? 'progress-bar' : ''
            }`}
            style={{ width: `${percentage}%` }}
          >
            {height === 'lg' && showPercentage && percentage > 10 && (
              <span className="text-xs text-white font-medium px-2 flex items-center h-full">
                {percentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </Tooltip>

      {percentage >= 100 && (
        <p className="text-xs text-red-500 mt-1 font-medium">Cap Reached!</p>
      )}
      {percentage >= 90 && percentage < 100 && (
        <p className="text-xs text-orange-500 mt-1 font-medium">
          {(100 - percentage).toFixed(0)}% remaining
        </p>
      )}
    </div>
  );
};

export default ProgressBar;