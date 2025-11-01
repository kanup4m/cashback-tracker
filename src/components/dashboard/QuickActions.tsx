import React from 'react';
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { exportToCSV } from '../../utils/storage';

interface QuickActionsProps {
  onAddTransaction: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAddTransaction }) => {
  const navigate = useNavigate();

  const handleExport = async () => {
    try {
      const csv = await exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashback-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const actions = [
    {
      label: 'Add Transaction',
      icon: <AddIcon />,
      onClick: onAddTransaction,
      color: 'primary' as const,
    },
    {
      label: 'View All',
      icon: <ReceiptIcon />,
      onClick: () => navigate('/transactions'),
      color: 'secondary' as const,
    },
    {
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      onClick: () => navigate('/analytics'),
      color: 'success' as const,
    },
    {
      label: 'Export',
      icon: <ExportIcon />,
      onClick: handleExport,
      color: 'outline' as const,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={action.onClick}
            variant={action.color}
            icon={action.icon}
            fullWidth
            className="flex-col py-4"
          >
            <span className="mt-2 text-sm">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fab lg:hidden gradient-purple text-white">
        <AddIcon onClick={onAddTransaction} />
      </div>
    </div>
  );
};

export default QuickActions;