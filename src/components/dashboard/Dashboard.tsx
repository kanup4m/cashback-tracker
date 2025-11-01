import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';
import { CycleDateRange, CycleType, DashboardStats } from '../../types';
import CashbackCard from './CashbackCard';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import CategoryBreakdown from './CategoryBreakdownCard';
import TransactionForm from '../transactions/TransactionForm';
import EnhancedCard from '../common/EnhancedCard';
import InteractiveDonutChart from '../analytics/InteractiveDonutChart';
import Sparkline from '../common/Sparkline';
import LoadingSpinner from '../common/LoadingSpinner';
import { getCycleProgress } from '../../utils/dateUtils';
import { pageVariants, listContainerVariants, listItemVariants } from '../../utils/animations';
import { useToast } from '../common/Toast';

interface DashboardProps {
  cycleRange: CycleDateRange;
  selectedCycle: CycleType;
  showTransactionForm?: boolean;
  onCloseTransactionForm?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  cycleRange, 
  selectedCycle,
  showTransactionForm = false,
  onCloseTransactionForm,
}) => {
  const toast = useToast();
  const { 
    transactions, 
    loading, 
    getCashbackSummary, 
    getDashboardStats 
  } = useTransactions();
  
  const [localShowForm, setLocalShowForm] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [airtelSummary, setAirtelSummary] = useState<any>(null);
  const [flipkartSummary, setFlipkartSummary] = useState<any>(null);

  // Gamification data
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [achievements, setAchievements] = useState<any[]>([]);

  // Calculate sparkline data (last 7 days cashback)
  const sparklineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === date.toDateString()
      );
      return dayTransactions.reduce((sum, t) => sum + t.cashbackEarned, 0);
    });
    return last7Days;
  }, [transactions]);

  useEffect(() => {
    if (!loading && transactions) {
      const dashboardStats = getDashboardStats(cycleRange);
      setStats(dashboardStats);

      const airtel = getCashbackSummary('AXIS_AIRTEL', cycleRange);
      const flipkart = getCashbackSummary('FLIPKART_AXIS', cycleRange);
      
      setAirtelSummary(airtel);
      setFlipkartSummary(flipkart);

      // Load gamification data
      loadGamificationData();
    }
  }, [transactions, cycleRange, loading, getCashbackSummary, getDashboardStats]);

  const loadGamificationData = () => {
    // Load streak from localStorage
    const savedStreak = localStorage.getItem('user_streak');
    if (savedStreak) {
      setStreak(JSON.parse(savedStreak));
    }

    // Define achievements
    const userAchievements = [
      {
        id: 'first_transaction',
        title: 'First Steps',
        description: 'Add your first transaction',
        icon: 'star' as const,
        unlocked: transactions.length > 0,
        rarity: 'common' as const,
        unlockedDate: transactions[0]?.createdAt,
      },
      {
        id: 'spend_1000',
        title: 'Big Spender',
        description: 'Spend ₹1,000 in total',
        icon: 'trophy' as const,
        unlocked: transactions.reduce((sum, t) => sum + t.amount, 0) >= 1000,
        progress: Math.min(transactions.reduce((sum, t) => sum + t.amount, 0), 1000),
        maxProgress: 1000,
        rarity: 'rare' as const,
      },
      {
        id: 'cashback_100',
        title: 'Century',
        description: 'Earn ₹100 in cashback',
        icon: 'fire' as const,
        unlocked: transactions.reduce((sum, t) => sum + t.cashbackEarned, 0) >= 100,
        progress: Math.min(transactions.reduce((sum, t) => sum + t.cashbackEarned, 0), 100),
        maxProgress: 100,
        rarity: 'epic' as const,
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: 'trend' as const,
        unlocked: streak.current >= 7,
        progress: Math.min(streak.current, 7),
        maxProgress: 7,
        rarity: 'legendary' as const,
      },
    ];

    setAchievements(userAchievements);
  };

  const handleFormClose = () => {
    setLocalShowForm(false);
    if (onCloseTransactionForm) {
      onCloseTransactionForm();
    }
    toast.success('Transaction added successfully!');
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  const cycleProgress = getCycleProgress(cycleRange);

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
    

      {/* Stats Grid with Enhanced Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={listContainerVariants}
        initial="initial"
        animate="animate"
      >
        {[
          {
            title: "Total Cashback",
            value: `₹${stats?.totalCashback.toFixed(2) || '0.00'}`,
            trend: 12.5,
            icon: "cashback",
            color: "success",
            sparkline: sparklineData,
          },
          {
            title: "Total Spent",
            value: `₹${stats?.totalSpent.toFixed(2) || '0.00'}`,
            icon: "spent",
            color: "primary",
          },
          {
            title: "Transactions",
            value: stats?.transactionCount.toString() || '0',
            icon: "transactions",
            color: "info",
          },
          {
            title: "Avg. Rate",
            value: `${((stats?.averageCashback || 0) / (stats?.totalSpent || 1) * 100).toFixed(1)}%`,
            icon: "percentage",
            color: "warning",
          }
        ].map((stat, index) => (
          <motion.div key={index} variants={listItemVariants}>
            <EnhancedCard
              variant="glass"
              hover
              className="h-full"
            >
              <StatsCard {...stat as any} />
            </EnhancedCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Credit Cards Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <CashbackCard
            cardType="AXIS_AIRTEL"
            summary={airtelSummary}
            cycleRange={cycleRange}
            cycleType={selectedCycle}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <CashbackCard
            cardType="FLIPKART_AXIS"
            summary={flipkartSummary}
            cycleRange={cycleRange}
            cycleType={selectedCycle}
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <QuickActions onAddTransaction={() => setLocalShowForm(true)} />
      </motion.div>

      {/* Bottom Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="lg:col-span-2">
          <RecentTransactions cycleRange={cycleRange} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          {/* Category Breakdown Donut Chart */}
          {airtelSummary && (
            <EnhancedCard
              title="Cashback Distribution"
              variant="bordered"
            >
              <InteractiveDonutChart
                data={airtelSummary.categoryBreakdown.map((cat: any) => ({
                  name: cat.categoryName,
                  value: cat.cashbackEarned,
                  color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                }))}
                centerLabel="Total"
                centerValue={`₹${airtelSummary.totalCashback.toFixed(2)}`}
              />
            </EnhancedCard>
          )}
        </div>
      </motion.div>

      {/* Transaction Form Modal */}
      {(showTransactionForm || localShowForm) && (
        <TransactionForm
          isOpen={showTransactionForm || localShowForm}
          onClose={handleFormClose}
          cycleRange={cycleRange}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;