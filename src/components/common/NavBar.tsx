import React from 'react';
import { NavLink } from 'react-router-dom';
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
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: <ReceiptIcon />,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      color: 'text-gray-600 dark:text-gray-400',
    },
  ];

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`
              }
            >
              <span className={`${item.color} transition-transform group-hover:scale-110`}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Card Icons */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-around py-2">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg gradient-airtel flex items-center justify-center text-white mb-1">
              <CreditCardIcon fontSize="small" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Airtel</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg gradient-flipkart flex items-center justify-center text-white mb-1">
              <CreditCardIcon fontSize="small" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Flipkart</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;