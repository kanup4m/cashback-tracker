import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: 'airtel' | 'flipkart' | 'purple' | 'orange' | 'none';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  headerAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  gradient = 'none',
  hover = false,
  onClick,
  className = '',
  headerAction,
}) => {
  const getGradientClass = () => {
    switch (gradient) {
      case 'airtel':
        return 'bg-gradient-to-br from-orange-400 to-orange-600';
      case 'flipkart':
        return 'bg-gradient-to-br from-purple-400 to-purple-600';
      case 'purple':
        return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'orange':
        return 'bg-gradient-to-br from-orange-500 to-yellow-500';
      case 'none':
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };

  const isGradient = gradient !== 'none';

  return (
    <div
      onClick={onClick}
      className={`
        ${getGradientClass()}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${isGradient ? 'text-white' : 'text-gray-900 dark:text-gray-100'}
        rounded-2xl shadow-lg overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      {(title || icon || headerAction) && (
        <div className={`p-6 ${children ? 'border-b' : ''} ${
          isGradient ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {icon && (
                <div className={`p-2 rounded-lg ${
                  isGradient ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900'
                }`}>
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className={`text-lg font-semibold ${
                    isGradient ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className={`text-sm mt-1 ${
                    isGradient ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                  }`}>
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
      {children && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;