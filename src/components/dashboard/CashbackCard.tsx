import React from 'react';
import { 
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { CardType, CashbackSummary, CycleType, CycleDateRange } from '../../types';
import { CREDIT_CARDS } from '../../constants/creditCards';

interface CashbackCardProps {
  cardType: CardType;
  summary: CashbackSummary | null;
  cycleRange: CycleDateRange;
  cycleType: CycleType;
}

const CashbackCard: React.FC<CashbackCardProps> = ({
  cardType,
  summary,
  cycleRange,
  cycleType,
}) => {
  const cardConfig = CREDIT_CARDS[cardType];
  const isAirtel = cardType === 'AXIS_AIRTEL';
  
  if (!summary) {
    return (
      <Card
        gradient={isAirtel ? 'airtel' : 'flipkart'}
        icon={<CreditCardIcon />}
        title={cardConfig.name}
        subtitle="No transactions this cycle"
      >
        <div className="text-center py-8">
          <p className="text-white/80">Start adding transactions to see your cashback</p>
        </div>
      </Card>
    );
  }

  const { totalSpent, totalCashback, categoryBreakdown } = summary;
  const cashbackRate = totalSpent > 0 ? (totalCashback / totalSpent) * 100 : 0;

  return (
    <Card
      gradient={isAirtel ? 'airtel' : 'flipkart'}
      icon={<CreditCardIcon />}
      title={cardConfig.name}
      subtitle={`${cycleType === 'QUARTERLY' ? 'Quarterly' : cycleRange.label}`}
      headerAction={
        cashbackRate > 3 && (
          <TrendingUpIcon className="text-white/80" />
        )
      }
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-white/70 text-sm">Spent</p>
          <p className="text-xl font-bold text-white">₹{totalSpent.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-white/70 text-sm">Cashback</p>
          <p className="text-xl font-bold text-white">₹{totalCashback.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-white/70 text-sm">Rate</p>
          <p className="text-xl font-bold text-white">{cashbackRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h4 className="text-white font-semibold mb-3">Category Breakdown</h4>
        {categoryBreakdown.map((category) => {
          const hasCapWarning = category.capLimit && 
            category.capUtilization >= 80;
          
          return (
            <div key={category.categoryId} className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-white font-medium text-sm">
                    {category.categoryName}
                  </p>
                  <p className="text-white/70 text-xs">
                    ₹{category.cashbackEarned.toFixed(0)} earned • 
                    {category.transactionCount} transactions
                  </p>
                </div>
                {hasCapWarning && (
                  <WarningIcon className="text-yellow-400" fontSize="small" />
                )}
              </div>
              
              {category.capLimit && (
                <ProgressBar
                  value={category.cashbackEarned}
                  max={category.capLimit}
                  showPercentage={true}
                  color="gradient"
                  height="sm"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Card Benefits Reminder */}
      <div className="mt-4 p-3 bg-white/10 rounded-lg">
        <p className="text-white/90 text-xs">
          {isAirtel 
            ? '💡 Remember: 25% on Airtel, 10% on utilities & food delivery'
            : '💡 Remember: 7.5% on Myntra, 5% on Flipkart & Cleartrip'}
        </p>
      </div>
    </Card>
  );
};

export default CashbackCard;