import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';
import TransactionCard from './TransactionCard';
import TransactionFilters from './TransactionFilters';
import TransactionForm from './TransactionForm';
import EmptyState from '../common/EmptyState';
import LoadingSpinner, { SkeletonLoader } from '../common/LoadingSpinner';
import Button from '../common/Button';
import { Transaction, FilterOptions, CycleDateRange } from '../../types';
import { Add as AddIcon } from '@mui/icons-material';
import { pageVariants, listContainerVariants, listItemVariants, tabVariants } from '../../utils/animations';

interface TransactionListProps {
  cycleRange: CycleDateRange;
}

const TransactionList: React.FC<TransactionListProps> = ({ cycleRange }) => {
  const { transactions, loading, getFilteredTransactions, deleteTransaction } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const filtered = getFilteredTransactions({
      ...filters,
      dateRange: tabValue === 0 
        ? { start: cycleRange.start, end: cycleRange.end }
        : filters.dateRange,
    });
    setFilteredTransactions(filtered);
  }, [transactions, filters, cycleRange, tabValue, getFilteredTransactions]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleCloseForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SkeletonLoader count={5} height="h-24" />
      </div>
    );
  }

  const hasTransactions = filteredTransactions.length > 0;

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Transactions
          </h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </motion.p>
        </div>
        
        <motion.div 
          className="flex gap-3 w-full sm:w-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Filters {showFilters ? '↑' : '↓'}
          </Button>
          <Button
            onClick={() => setShowTransactionForm(true)}
            variant="primary"
            icon={<AddIcon />}
            className="flex-1 sm:flex-none"
          >
            Add Transaction
          </Button>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Box className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={`Current Cycle (${filteredTransactions.length})`} />
            <Tab label="All Transactions" />
          </Tabs>
        </Box>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TransactionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              totalResults={filteredTransactions.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List */}
      <AnimatePresence mode="wait">
        {hasTransactions ? (
          <motion.div 
            className="grid grid-cols-1 gap-4"
            variants={listContainerVariants}
            initial="initial"
            animate="animate"
            key="transaction-list"
          >
            {filteredTransactions.map((transaction, index) => (
              <motion.div 
                key={transaction.id}
                variants={listItemVariants}
                custom={index}
                layout
              >
                <TransactionCard
                  transaction={transaction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              type={filters.searchTerm ? 'search' : 'transactions'}
              onAction={() => 
                filters.searchTerm 
                  ? setFilters({}) 
                  : setShowTransactionForm(true)
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Form Modal */}
      <AnimatePresence>
        {showTransactionForm && (
          <TransactionForm
            isOpen={showTransactionForm}
            onClose={handleCloseForm}
            cycleRange={cycleRange}
            editTransaction={editingTransaction}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button for Mobile */}
      <motion.button
        onClick={() => setShowTransactionForm(true)}
        className="fab lg:hidden gradient-purple text-white shadow-lg"
        aria-label="Add transaction"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <AddIcon />
      </motion.button>
    </motion.div>
  );
};

export default TransactionList;