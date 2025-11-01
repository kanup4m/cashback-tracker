import React from 'react';
import { CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
  color?: 'primary' | 'secondary' | 'white';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  fullScreen = false,
  message,
  color = 'primary',
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 40;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary':
        return '#9C27B0';
      case 'secondary':
        return '#FF9800';
      case 'white':
        return '#FFFFFF';
      default:
        return '#9C27B0';
    }
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <CircularProgress
        size={getSize()}
        sx={{ color: getColor() }}
        thickness={4}
      />
      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

// Skeleton Loader Component
export const SkeletonLoader: React.FC<{ count?: number; height?: string }> = ({
  count = 1,
  height = 'h-20',
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${height}`} />
        </div>
      ))}
    </div>
  );
};

// Loading Card Component
export const LoadingCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
};

export default LoadingSpinner;