import React from 'react';
import {
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Button from './Button';

interface EmptyStateProps {
  type?: 'transactions' | 'search' | 'analytics' | 'custom';
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'transactions',
  title,
  message,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'transactions':
        return {
          defaultIcon: <ReceiptIcon sx={{ fontSize: 80 }} />,
          defaultTitle: 'No Transactions Yet',
          defaultMessage: 'Start tracking your cashback by adding your first transaction.',
          defaultActionLabel: 'Add Transaction',
        };
      case 'search':
        return {
          defaultIcon: <SearchIcon sx={{ fontSize: 80 }} />,
          defaultTitle: 'No Results Found',
          defaultMessage: 'Try adjusting your filters or search criteria.',
          defaultActionLabel: 'Clear Filters',
        };
      case 'analytics':
        return {
          defaultIcon: <AnalyticsIcon sx={{ fontSize: 80 }} />,
          defaultTitle: 'No Data Available',
          defaultMessage: 'Add some transactions to see your cashback analytics.',
          defaultActionLabel: 'Go to Transactions',
        };
      case 'custom':
      default:
        return {
          defaultIcon: <ReceiptIcon sx={{ fontSize: 80 }} />,
          defaultTitle: title || 'No Data',
          defaultMessage: message || 'No data available.',
          defaultActionLabel: actionLabel,
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-gray-300 dark:text-gray-600 mb-4">
        {icon || content.defaultIcon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title || content.defaultTitle}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {message || content.defaultMessage}
      </p>
      
      {(actionLabel || content.defaultActionLabel) && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          icon={<AddIcon />}
        >
          {actionLabel || content.defaultActionLabel}
        </Button>
      )}
    </div>
  );
};

// Empty State with Illustration
export const IllustratedEmptyState: React.FC<EmptyStateProps & { illustration?: string }> = ({
  illustration,
  ...props
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {illustration && (
        <img
          src={illustration}
          alt="Empty state"
          className="w-64 h-64 object-contain mb-6 opacity-75"
        />
      )}
      <EmptyState {...props} />
    </div>
  );
};

export default EmptyState;