import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface EnhancedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  variant?: 'default' | 'glass' | 'gradient' | 'neumorphic' | 'bordered';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  tooltip?: string;
  isNew?: boolean;
  loading?: boolean;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  badge,
  variant = 'default',
  hover = false,
  onClick,
  className = '',
  headerAction,
  footer,
  tooltip,
  isNew = false,
  loading = false,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'glass':
        return 'glass-morphism';
      case 'gradient':
        return 'gradient-mesh';
      case 'neumorphic':
        return 'neumorphism-light dark:neumorphism-dark';
      case 'bordered':
        return 'bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };

  return (
    <motion.div
      className={`
        ${getVariantClass()}
        rounded-2xl shadow-lg overflow-hidden
        ${hover ? 'cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* New Badge */}
      {isNew && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full animate-pulse">
            NEW
          </span>
        </div>
      )}

      {/* Header */}
      {(title || icon || badge || headerAction) && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {icon && (
                <motion.div 
                  className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {icon}
                </motion.div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h3>
                  {tooltip && (
                    <Tooltip title={tooltip} arrow placement="top">
                      <InfoIcon fontSize="small" className="text-gray-400 cursor-help" />
                    </Tooltip>
                  )}
                  {badge !== undefined && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-semibold rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {headerAction && (
              <div>{headerAction}</div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedCard;