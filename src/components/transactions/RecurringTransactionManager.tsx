import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Repeat as RepeatIcon } from '@mui/icons-material';
import Button from '../common/Button';
import { CardType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface RecurringTransaction {
  id: string;
  name: string;
  cardType: CardType;
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  startDate: Date;
  endDate?: Date;
  enabled: boolean;
  lastExecuted?: Date;
  nextExecution: Date;
}

const RecurringTransactionManager: React.FC = () => {
  const [recurringTxns, setRecurringTxns] = useState<RecurringTransaction[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load recurring transactions
    const saved = localStorage.getItem('recurring_transactions');
    if (saved) {
      setRecurringTxns(JSON.parse(saved));
    }
  }, []);

  const saveRecurring = (txns: RecurringTransaction[]) => {
    localStorage.setItem('recurring_transactions', JSON.stringify(txns));
    setRecurringTxns(txns);
  };

  const addRecurringTransaction = (txn: Omit<RecurringTransaction, 'id' | 'nextExecution'>) => {
    const newTxn: RecurringTransaction = {
      ...txn,
      id: uuidv4(),
      nextExecution: calculateNextExecution(txn.startDate, txn.frequency),
    };
    saveRecurring([...recurringTxns, newTxn]);
  };

  const calculateNextExecution = (startDate: Date, frequency: string): Date => {
    const next = new Date(startDate);
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
    }
    return next;
  };

  const toggleRecurring = (id: string) => {
    const updated = recurringTxns.map(txn =>
      txn.id === id ? { ...txn, enabled: !txn.enabled } : txn
    );
    saveRecurring(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <RepeatIcon /> Recurring Transactions
        </h2>
        <Button onClick={() => setShowAddForm(true)} variant="primary">
          Add Recurring
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recurringTxns.map(txn => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{txn.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ₹{txn.amount} • {txn.frequency}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Next: {txn.nextExecution.toLocaleDateString()}
                </p>
              </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={txn.enabled}
                    onChange={() => toggleRecurring(txn.id)}
                  />
                }
                label={txn.enabled ? 'Active' : 'Paused'}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecurringTransactionManager;