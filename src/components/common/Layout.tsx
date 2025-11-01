import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from './NavBar';
import CycleSelector from './CycleSelector';
import { CycleType, CycleDateRange } from '../../types';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
  currentCycle: CycleType;
  onCycleChange: (cycle: CycleType) => void;
  cycleRange: CycleDateRange;
  onCustomDateChange: (start: Date, end: Date) => void;
  onAddTransaction?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentCycle,
  onCycleChange,
  cycleRange,
  onCustomDateChange,
  onAddTransaction,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/transactions':
        return 'Transactions';
      case '/analytics':
        return 'Analytics';
      case '/settings':
        return 'Settings';
      default:
        return 'Cashback Tracker';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 pb-4 shadow-sm">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              💳 Cashback
            </h1>
          </div>
          <NavBar onClose={() => {}} />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white dark:bg-gray-800 px-4 py-4 shadow-md sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
          {getPageTitle()}
        </div>

        {/* Mobile Quick Actions */}
        <div className="flex items-center gap-2">
          <Tooltip title="Search (⌘K)">
            <IconButton 
              size="small"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { 
                  key: 'k', 
                  metaKey: true,
                  bubbles: true 
                });
                document.dispatchEvent(event);
              }}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
          
          {onAddTransaction && (
            <Tooltip title="Add Transaction (⌘N)">
              <IconButton 
                size="small"
                onClick={onAddTransaction}
                className="text-purple-600 add-transaction-button hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
<AnimatePresence>
  {mobileMenuOpen && (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className="fixed inset-0 flex">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className="relative mr-16 flex w-full max-w-xs flex-1"
        >
          {/* Close Button */}
          <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
            <motion.button
              type="button"
              className="p-2.5 bg-gray-800 rounded-full shadow-lg border border-gray-700"
              onClick={() => setMobileMenuOpen(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">Close sidebar</span>
              <CloseIcon className="h-6 w-6 text-gray-300" />
            </motion.button>
          </div>

          {/* Sidebar Content - Black/Dark */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 shadow-2xl bg-gradient-to-b from-gray-900 via-black to-gray-900">
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center border-b border-gray-800">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                💳 Cashback
              </h1>
            </div>
            
            {/* Navigation */}
            <NavBar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </motion.div>
      </div>
    </div>
  )}
</AnimatePresence>

      {/* Main content */}
      <main className="lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Cycle Selector */}
          <div className="mb-6 cycle-selector">
            <CycleSelector
              currentCycle={currentCycle}
              onCycleChange={onCycleChange}
              cycleRange={cycleRange}
              onCustomDateChange={onCustomDateChange}
            />
          </div>

          {/* Page content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;