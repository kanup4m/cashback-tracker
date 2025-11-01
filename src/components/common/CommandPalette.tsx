import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: Command[] = [
    {
      id: 'add-transaction',
      title: 'Add Transaction',
      description: 'Add a new cashback transaction',
      icon: <AddIcon />,
      action: () => {
        onAddTransaction();
        onClose();
      },
      keywords: ['add', 'new', 'transaction', 'create'],
    },
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      icon: <DashboardIcon />,
      action: () => {
        navigate('/dashboard');
        onClose();
      },
      keywords: ['dashboard', 'home', 'overview'],
    },
    {
      id: 'transactions',
      title: 'View Transactions',
      icon: <ReceiptIcon />,
      action: () => {
        navigate('/transactions');
        onClose();
      },
      keywords: ['transactions', 'history', 'list'],
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      icon: <AnalyticsIcon />,
      action: () => {
        navigate('/analytics');
        onClose();
      },
      keywords: ['analytics', 'stats', 'reports', 'charts'],
    },
    {
      id: 'settings',
      title: 'Open Settings',
      icon: <SettingsIcon />,
      action: () => {
        navigate('/settings');
        onClose();
      },
      keywords: ['settings', 'preferences', 'config'],
    },
  ];

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(kw => kw.includes(searchLower))
    );
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Command Palette */}
        <motion.div
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <SearchIcon className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              <div className="py-2">
                {filteredCommands.map((cmd, index) => (
                  <motion.button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`
                      w-full flex items-center gap-4 px-4 py-3 text-left
                      transition-colors
                      ${index === selectedIndex 
                        ? 'bg-purple-50 dark:bg-purple-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                    onMouseEnter={() => setSelectedIndex(index)}
                    whileHover={{ x: 4 }}
                  >
                    <div className={`
                      p-2 rounded-lg
                      ${index === selectedIndex
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }
                    `}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {cmd.title}
                      </div>
                      {cmd.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {cmd.description}
                        </div>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <ArrowIcon className="text-purple-500" />
                    )}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <SearchIcon fontSize="large" className="mb-2 opacity-50" />
                <p>No commands found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded">↵</kbd>
                  Select
                </span>
              </div>
              <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded">⌘K</kbd> to open</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;