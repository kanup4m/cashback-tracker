import React, { useState } from 'react';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  CreditCard as CardIcon,
} from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Transaction } from '../../types';
import { format } from 'date-fns';
import { CREDIT_CARDS } from '../../constants/creditCards';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(transaction);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(transaction.id);
  };

  const cardConfig = CREDIT_CARDS[transaction.cardType];
  const categoryConfig = cardConfig.categories.find(c => c.id === transaction.category);
  const isAirtel = transaction.cardType === 'AXIS_AIRTEL';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between">
        {/* Left Section */}
        <div className="flex items-start gap-4">
          {/* Card Icon */}
          <div className={`p-3 rounded-lg ${
            isAirtel 
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          }`}>
            <CardIcon />
          </div>

          {/* Transaction Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {categoryConfig?.name || transaction.category}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isAirtel
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              }`}>
                {cardConfig.name.split(' ')[0]}
              </span>
            </div>

            {(transaction.description || transaction.merchant) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {transaction.merchant && <span className="font-medium">{transaction.merchant}</span>}
                {transaction.merchant && transaction.description && ' • '}
                {transaction.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
              <span>{format(transaction.date, 'dd MMM yyyy')}</span>
              <span>•</span>
              <span>{transaction.cashbackRate}% cashback</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-start gap-2">
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ₹{transaction.amount.toFixed(2)}
            </p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              +₹{transaction.cashbackEarned.toFixed(2)}
            </p>
          </div>

          {/* Actions Menu */}
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleEdit}>
              <EditIcon fontSize="small" className="mr-2" />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDelete} className="text-red-600">
              <DeleteIcon fontSize="small" className="mr-2" />
              Delete
            </MenuItem>
          </Menu>
        </div>
      </div>

      {/* Mobile Swipe Actions (Optional Enhancement) */}
      <div className="mt-3 flex gap-2 lg:hidden">
        <button
          onClick={() => onEdit(transaction)}
          className="flex-1 py-2 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="flex-1 py-2 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;