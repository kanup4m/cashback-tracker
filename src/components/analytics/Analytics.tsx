import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';
import { CycleDateRange, CycleType, CardType } from '../../types';
import CashbackChart from './CashbackChart';
import CategoryBreakdown from './CategoryBreakdown';
import TrendAnalysis from './TrendAnalysis';
import ComparisonChart from './ComparisonChart';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { 
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Category as CategoryIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { Tab, Tabs, Box } from '@mui/material';
import Button from '../common/Button';
import { exportToCSV, exportToJSON } from '../../utils/storage';
import { format } from 'date-fns';
import { pageVariants, tabVariants } from '../../utils/animations';

interface AnalyticsProps {
  cycleRange: CycleDateRange;
  selectedCycle: CycleType;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          key={index}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ width: '100%' }}
        >
          <Box sx={{ py: 3 }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Analytics: React.FC<AnalyticsProps> = ({ cycleRange, selectedCycle }) => {
  const { transactions, loading, getCashbackSummary, getDashboardStats } = useTransactions();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedCard, setSelectedCard] = useState<CardType | 'ALL'>('ALL');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Get stats for the current cycle
  const dashboardStats = useMemo(() => {
    return getDashboardStats(cycleRange);
  }, [getDashboardStats, cycleRange]);

  // Get cashback summaries for both cards
  const airtelSummary = useMemo(() => {
    return getCashbackSummary('AXIS_AIRTEL', cycleRange);
  }, [getCashbackSummary, cycleRange]);

  const flipkartSummary = useMemo(() => {
    return getCashbackSummary('FLIPKART_AXIS', cycleRange);
  }, [getCashbackSummary, cycleRange]);

  // Export handlers
  const handleExportCSV = async () => {
    const csv = await exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashback-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = async () => {
    const json = await exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashback-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading analytics..." />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        type="analytics"
        onAction={() => window.location.href = '/transactions'}
      />
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {cycleRange.label}
          </p>
        </div>
        
        <div className="flex gap-2 no-print">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            icon={<DownloadIcon fontSize="small" />}
          >
            Export CSV
          </Button>
          <Button
            onClick={handleExportJSON}
            variant="outline"
            size="sm"
            icon={<DownloadIcon fontSize="small" />}
          >
            Export JSON
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            icon={<PrintIcon fontSize="small" />}
          >
            Print
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {[
          {
            title: 'Total Cashback',
            subtitle: 'This cycle',
            icon: <AccountBalanceIcon className="text-green-500" />,
            value: `₹${dashboardStats.totalCashback.toFixed(2)}`,
            description: `from ₹${dashboardStats.totalSpent.toFixed(2)} spent`,
            color: 'border-green-500',
          },
          {
            title: 'Average Cashback',
            subtitle: 'Per transaction',
            icon: <TrendingUpIcon className="text-blue-500" />,
            value: `₹${dashboardStats.averageCashback.toFixed(2)}`,
            description: `${dashboardStats.transactionCount} transactions`,
            color: 'border-blue-500',
          },
          {
            title: 'Top Category',
            subtitle: 'Most spent',
            icon: <CategoryIcon className="text-purple-500" />,
            value: dashboardStats.topCategory,
            description: `Cycle ${dashboardStats.cycleProgress.toFixed(0)}% complete`,
            color: 'border-purple-500',
          },
          {
            title: 'Cashback Rate',
            subtitle: 'Overall efficiency',
            icon: <CompareIcon className="text-orange-500" />,
            value: `${dashboardStats.totalSpent > 0 
              ? ((dashboardStats.totalCashback / dashboardStats.totalSpent) * 100).toFixed(2)
              : '0.00'}%`,
            description: 'Effective rate',
            color: 'border-orange-500',
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <Card
              title={stat.title}
              subtitle={stat.subtitle}
              icon={stat.icon}
              className={`border-l-4 ${stat.color} hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stat.description}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Card Selector */}
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { value: 'ALL', label: 'All Cards' },
          { value: 'AXIS_AIRTEL', label: 'Axis Airtel' },
          { value: 'FLIPKART_AXIS', label: 'Flipkart Axis' },
        ].map((option) => (
          <Button
            key={option.value}
            onClick={() => setSelectedCard(option.value as CardType | 'ALL')}
            variant={selectedCard === option.value ? 'primary' : 'outline'}
            size="sm"
          >
            {option.label}
          </Button>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Box sx={{ width: '100%' }}>
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper',
              borderRadius: '12px 12px 0 0',
            }}
          >
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" />
              <Tab label="Categories" />
              <Tab label="Trends" />
              <Tab label="Comparison" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={currentTab} index={0}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CashbackChart
                transactions={transactions}
                cycleRange={cycleRange}
                cardFilter={selectedCard === 'ALL' ? undefined : selectedCard}
              />
              <CategoryBreakdown
                summary={selectedCard === 'AXIS_AIRTEL' ? airtelSummary : 
                         selectedCard === 'FLIPKART_AXIS' ? flipkartSummary :
                         undefined}
                cardType={selectedCard === 'ALL' ? undefined : selectedCard}
              />
            </div>
          </TabPanel>

          {/* Categories Tab */}
          <TabPanel value={currentTab} index={1}>
            <CategoryBreakdown
              summary={selectedCard === 'AXIS_AIRTEL' ? airtelSummary : 
                       selectedCard === 'FLIPKART_AXIS' ? flipkartSummary :
                       undefined}
              cardType={selectedCard === 'ALL' ? undefined : selectedCard}
              detailed={true}
            />
          </TabPanel>

          {/* Trends Tab */}
          <TabPanel value={currentTab} index={2}>
            <TrendAnalysis
              transactions={transactions}
              cycleType={selectedCycle}
              cardFilter={selectedCard === 'ALL' ? undefined : selectedCard}
            />
          </TabPanel>

          {/* Comparison Tab */}
          <TabPanel value={currentTab} index={3}>
            <ComparisonChart
              airtelSummary={airtelSummary}
              flipkartSummary={flipkartSummary}
              cycleRange={cycleRange}
            />
          </TabPanel>
        </Box>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;