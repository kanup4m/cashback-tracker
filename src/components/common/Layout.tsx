import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto glass-morphism border-r border-gray-200 dark:border-gray-700 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <h1 className="text-2xl font-bold text-gradient">
              💳 Cashback
            </h1>
          </div>
          <NavBar onClose={() => {}} />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white dark:bg-gray-800 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
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
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
          
          {onAddTransaction && (
            <Tooltip title="Add Transaction (⌘N)">
              <IconButton 
                size="small"
                onClick={onAddTransaction}
                className="text-purple-600 add-transaction-button"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Mobile sidebar - same as before */}
      <div className={`lg:hidden ${mobileMenuOpen ? 'relative z-50' : 'hidden'}`}>
        <div
          className={`fixed inset-0 bg-gray-900/80 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div className="fixed inset-0 flex">
          <div
            className={`relative mr-16 flex w-full max-w-xs flex-1 transform ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } transition duration-300 ease-in-out`}
          >
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <CloseIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto glass-morphism px-6 pb-4 ring-1 ring-white/10">
              <div className="flex h-16 shrink-0 items-center">
                <h1 className="text-2xl font-bold text-gradient">
                  💳 Cashback
                </h1>
              </div>
              <NavBar onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      </div>

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
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;