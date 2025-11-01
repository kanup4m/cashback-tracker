import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // CHANGED: BrowserRouter → HashRouter
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastProvider } from './components/common/Toast';
import { TransactionProvider } from './contexts/TransactionContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { useThemeHandler } from './hooks/useTheme';
import Layout from './components/common/Layout';
import Dashboard from './components/dashboard/Dashboard';
import TransactionList from './components/transactions/TransactionList';
import Analytics from './components/analytics/Analytics';
import Settings from './components/settings/Settings';
import CommandPalette from './components/common/CommandPalette';
import OnboardingTour from './components/onboarding/OnboardingTour';
import { CycleType, CycleDateRange } from './types';
import { getCycleRange } from './utils/dateUtils';
import { NotificationScheduler } from './services/notificationScheduler';
import { NotificationService } from './services/notificationService';

const AppContent: React.FC = () => {
  const { settings } = useSettings();
  useThemeHandler();
  
  const [selectedCycle, setSelectedCycle] = useState<CycleType>(settings.defaultCycle);
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(),
    end: new Date(),
  });
  const [currentCycleRange, setCurrentCycleRange] = useState<CycleDateRange>(
    getCycleRange(settings.defaultCycle, undefined, undefined, settings.statementCycleDate)
  );

  // Command Palette State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  
  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Initialize notification scheduler
    NotificationScheduler.getInstance();

    // Check for first time user and request permission
    const hasRequestedPermission = localStorage.getItem('notification_permission_requested');
    if (!hasRequestedPermission) {
      setTimeout(() => {
        NotificationService.getInstance().requestPermission();
        localStorage.setItem('notification_permission_requested', 'true');
      }, 3000); // Wait 3 seconds before asking
    }
  }, []);
  
  useEffect(() => {
    // Check if first time user
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      
      // Cmd/Ctrl + N - New Transaction
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowTransactionForm(true);
      }

      // ESC - Close Command Palette
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const useDarkMode = (() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })();

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: useDarkMode ? 'dark' : 'light',
      primary: {
        main: '#9C27B0',
        light: '#E1BEE7',
        dark: '#7B1FA2',
      },
      secondary: {
        main: '#FF9800',
        light: '#FFE0B2',
        dark: '#F57C00',
      },
      success: {
        main: '#4CAF50',
      },
      warning: {
        main: '#FFC107',
      },
      error: {
        main: '#F44336',
      },
      background: {
        default: useDarkMode ? '#111827' : '#F9FAFB',
        paper: useDarkMode ? '#1F2937' : '#FFFFFF',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 16px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: useDarkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }), [useDarkMode]);

  useEffect(() => {
    const newCycleRange = getCycleRange(
      selectedCycle,
      customDateRange.start,
      customDateRange.end,
      settings.statementCycleDate
    );
    setCurrentCycleRange(newCycleRange);
  }, [selectedCycle, customDateRange, settings.statementCycleDate]);

  const handleCycleChange = (newCycle: CycleType) => {
    setSelectedCycle(newCycle);
  };

  const handleCustomDateChange = (start: Date, end: Date) => {
    setCustomDateRange({ start, end });
    if (selectedCycle === 'CUSTOM') {
      setCurrentCycleRange(getCycleRange('CUSTOM', start, end));
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router> {/* No basename needed with HashRouter */}
        <Layout
          currentCycle={selectedCycle}
          onCycleChange={handleCycleChange}
          cycleRange={currentCycleRange}
          onCustomDateChange={handleCustomDateChange}
          onAddTransaction={() => setShowTransactionForm(true)}
        >
          <Routes>
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  cycleRange={currentCycleRange}
                  selectedCycle={selectedCycle}
                  showTransactionForm={showTransactionForm}
                  onCloseTransactionForm={() => setShowTransactionForm(false)}
                />
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <TransactionList 
                  cycleRange={currentCycleRange}
                />
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <Analytics 
                  cycleRange={currentCycleRange}
                  selectedCycle={selectedCycle}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={<Settings />} 
            />
          </Routes>
        </Layout>

        {/* Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onAddTransaction={() => {
            setShowTransactionForm(true);
            setCommandPaletteOpen(false);
          }}
        />

        {/* Onboarding Tour */}
        {showOnboarding && (
          <OnboardingTour onComplete={handleOnboardingComplete} />
        )}
      </Router>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <TransactionProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </TransactionProvider>
    </SettingsProvider>
  );
};

export default App;