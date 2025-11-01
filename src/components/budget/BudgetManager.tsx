import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  LinearProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  AccountBalance as BudgetIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { CardType } from '../../types';

interface Budget {
  id: string;
  category: string;
  cardType?: CardType;
  limit: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  alertThreshold: number; // percentage
}

const BudgetManager: React.FC<{ currentSpending: Record<string, number> }> = ({
  currentSpending,
}) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Load budgets
    const saved = localStorage.getItem('budgets');
    if (saved) {
      setBudgets(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Check for budget alerts
    const newAlerts: string[] = [];
    budgets.forEach(budget => {
      const spent = currentSpending[budget.category] || 0;
      const percentage = (spent / budget.limit) * 100;
      
      if (percentage >= budget.alertThreshold) {
        newAlerts.push(
          `Warning: ${percentage.toFixed(0)}% of ${budget.category} budget used`
        );
      }
    });
    setAlerts(newAlerts);
  }, [budgets, currentSpending]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <BudgetIcon /> Budget Tracking
      </h2>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Alert key={idx} severity="warning" icon={<WarningIcon />}>
              <AlertTitle>Budget Alert</AlertTitle>
              {alert}
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map(budget => {
          const spent = currentSpending[budget.category] || 0;
          const percentage = (spent / budget.limit) * 100;
          const color = percentage >= 90 ? 'error' : percentage >= 70 ? 'warning' : 'success';

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{budget.category}</h3>
                  <span className="text-sm text-gray-600">
                    ₹{spent.toFixed(0)} / ₹{budget.limit}
                  </span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(percentage, 100)}
                  color={color}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  {percentage.toFixed(1)}% used • ₹{(budget.limit - spent).toFixed(0)} remaining
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetManager;