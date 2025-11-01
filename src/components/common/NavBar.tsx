import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';

interface NavBarProps {
  onClose: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onClose }) => {
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: <ReceiptIcon />,
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: <AnalyticsIcon />,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <SettingsIcon />,
    },
  ];

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-2">
        {navItems.map((item, index) => (
          <motion.li 
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-800 text-purple-400 shadow-lg border border-purple-500/30 lg:bg-purple-50 lg:text-purple-700 dark:lg:bg-purple-900/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white lg:text-gray-700 dark:lg:text-gray-300 lg:hover:bg-gray-100 dark:lg:hover:bg-gray-700'
                }`
              }
            >
              <span className="transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </motion.li>
        ))}
      </ul>

      {/* Card Icons */}
      <div className="mt-auto pt-4 border-t border-gray-800 lg:border-gray-200 dark:lg:border-gray-700">
        <div className="flex items-center justify-around py-2">
          <motion.div 
            className="flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white mb-1 shadow-lg transition-all hover:shadow-xl">
              <CreditCardIcon fontSize="small" />
            </div>
            <span className="text-xs text-gray-400 lg:text-gray-600 dark:lg:text-gray-400 font-medium">
              Airtel
            </span>
          </motion.div>
          <motion.div 
            className="flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white mb-1 shadow-lg transition-all hover:shadow-xl">
              <CreditCardIcon fontSize="small" />
            </div>
            <span className="text-xs text-gray-400 lg:text-gray-600 dark:lg:text-gray-400 font-medium">
              Flipkart
            </span>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;