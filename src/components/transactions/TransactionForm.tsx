import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import { useTransactions } from '../../contexts/TransactionContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Transaction, CardType, CycleDateRange } from '../../types';
import { CREDIT_CARDS } from '../../constants/creditCards';
import { calculateCashback } from '../../utils/cashbackCalculator';
import { format } from 'date-fns';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  cycleRange: CycleDateRange;
  editTransaction?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  cycleRange,
  editTransaction,
}) => {
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [cardType, setCardType] = useState<CardType>('AXIS_AIRTEL');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  
  // Cashback preview
  const [cashbackPreview, setCashbackPreview] = useState<{
    cashbackEarned: number;
    capReached: boolean;
    remainingCap: number | null;
  } | null>(null);

  // Initialize form with edit data
  useEffect(() => {
    if (editTransaction) {
      setCardType(editTransaction.cardType);
      setCategory(editTransaction.category);
      setAmount(editTransaction.amount.toString());
      setDate(format(editTransaction.date, 'yyyy-MM-dd'));
      setDescription(editTransaction.description || '');
      setMerchant(editTransaction.merchant || '');
    }
  }, [editTransaction]);

  // Calculate cashback preview
  useEffect(() => {
    if (amount && category && cardType) {
      const preview = calculateCashback(
        parseFloat(amount),
        cardType,
        category,
        transactions,
        cycleRange
      );
      setCashbackPreview(preview);
    } else {
      setCashbackPreview(null);
    }
  }, [amount, category, cardType, transactions, cycleRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const transactionDate = new Date(date);
      const transactionAmount = parseFloat(amount);
      
      if (!cashbackPreview) {
        throw new Error('Unable to calculate cashback');
      }

      const categoryConfig = CREDIT_CARDS[cardType].categories.find(
        c => c.id === category
      );

      const transactionData = {
        cardType,
        category,
        amount: transactionAmount,
        cashbackRate: categoryConfig?.cashbackRate || 0,
        cashbackEarned: cashbackPreview.cashbackEarned,
        date: transactionDate,
        description: description.trim() || undefined,
        merchant: merchant.trim() || undefined,
      };

      if (editTransaction) {
        await updateTransaction(editTransaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const cardConfig = CREDIT_CARDS[cardType];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Card Selection */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Credit Card
          </p>
          <RadioGroup
            value={cardType}
            onChange={(e) => {
              setCardType(e.target.value as CardType);
              setCategory(''); // Reset category when card changes
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormControlLabel
                value="AXIS_AIRTEL"
                control={<Radio />}
                label={
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded gradient-airtel" />
                    <span>Axis Airtel</span>
                  </div>
                }
                className="border rounded-lg p-3"
              />
              <FormControlLabel
                value="FLIPKART_AXIS"
                control={<Radio />}
                label={
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded gradient-flipkart" />
                    <span>Flipkart Axis</span>
                  </div>
                }
                className="border rounded-lg p-3"
              />
            </div>
          </RadioGroup>
        </div>

        {/* Category Selection */}
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {cardConfig.categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                <div>
                  <div className="font-medium">{cat.name}</div>
                  <div className="text-xs text-gray-500">
                    {cat.cashbackRate}% cashback
                    {cat.capAmount && ` • ₹${cat.capAmount} cap`}
                  </div>
                </div>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Amount */}
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          required
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
          inputProps={{ min: 0, step: 0.01 }}
        />

        {/* Date */}
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
        />

        {/* Optional Fields */}
        <TextField
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        <TextField
          label="Merchant (Optional)"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          fullWidth
        />

        {/* Cashback Preview */}
        {cashbackPreview && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
              Cashback Preview
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>₹{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashback Rate:</span>
                <span>{cardConfig.categories.find(c => c.id === category)?.cashbackRate}%</span>
              </div>
              <div className="flex justify-between font-medium text-green-700 dark:text-green-400">
                <span>Cashback Earned:</span>
                <span>₹{cashbackPreview.cashbackEarned.toFixed(2)}</span>
              </div>
              {cashbackPreview.capReached && (
                <Alert severity="warning" className="mt-2">
                  Cap limit reached for this category
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!amount || !category || !date}
          >
            {editTransaction ? 'Update' : 'Add'} Transaction
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionForm;