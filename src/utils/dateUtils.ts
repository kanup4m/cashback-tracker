import { 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subDays,
  format,
  isWithinInterval,
  startOfQuarter,
  endOfQuarter,
} from 'date-fns';
import { CycleType, CycleDateRange } from '../types';

export const getStatementCycle = (date: Date = new Date(), cycleDate: number = 12): CycleDateRange => {
  const currentDate = date.getDate();
  let startDate: Date;
  let endDate: Date;

  if (currentDate >= cycleDate) {
    // Current cycle started this month
    startDate = new Date(date.getFullYear(), date.getMonth(), cycleDate);
    endDate = subDays(new Date(date.getFullYear(), date.getMonth() + 1, cycleDate), 1);
  } else {
    // Current cycle started last month
    startDate = new Date(date.getFullYear(), date.getMonth() - 1, cycleDate);
    endDate = subDays(new Date(date.getFullYear(), date.getMonth(), cycleDate), 1);
  }

  return {
    start: startDate,
    end: endDate,
    type: 'STATEMENT',
    label: `${format(startDate, 'dd MMM')} - ${format(endDate, 'dd MMM yyyy')}`,
  };
};

export const getCalendarMonth = (date: Date = new Date()): CycleDateRange => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return {
    start,
    end,
    type: 'CALENDAR',
    label: format(date, 'MMMM yyyy'),
  };
};

export const getQuarterlyCycle = (date: Date = new Date()): CycleDateRange => {
  const start = startOfQuarter(date);
  const end = endOfQuarter(date);
  const quarter = Math.floor(date.getMonth() / 3) + 1;

  return {
    start,
    end,
    type: 'QUARTERLY',
    label: `Q${quarter} ${date.getFullYear()}`,
  };
};

export const getCustomCycle = (startDate: Date, endDate: Date): CycleDateRange => {
  return {
    start: startDate,
    end: endDate,
    type: 'CUSTOM',
    label: `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`,
  };
};

export const getCycleRange = (
  cycleType: CycleType,
  customStart?: Date,
  customEnd?: Date,
  statementDate: number = 12
): CycleDateRange => {
  switch (cycleType) {
    case 'STATEMENT':
      return getStatementCycle(new Date(), statementDate);
    case 'CALENDAR':
      return getCalendarMonth();
    case 'QUARTERLY':
      return getQuarterlyCycle();
    case 'CUSTOM':
      if (customStart && customEnd) {
        return getCustomCycle(customStart, customEnd);
      }
      // Fallback to calendar month if custom dates not provided
      return getCalendarMonth();
    default:
      return getCalendarMonth();
  }
};

export const isDateInCycle = (date: Date, cycle: CycleDateRange): boolean => {
  return isWithinInterval(date, { start: cycle.start, end: cycle.end });
};

export const formatDate = (date: Date, dateFormat: string = 'DD/MM/YYYY'): string => {
  const formatString = dateFormat
    .replace('DD', 'dd')
    .replace('MM', 'MM')
    .replace('YYYY', 'yyyy');
  return format(date, formatString);
};

export const getDaysInCycle = (cycle: CycleDateRange): number => {
  const diffTime = Math.abs(cycle.end.getTime() - cycle.start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};

export const getCycleProgress = (cycle: CycleDateRange): number => {
  const now = new Date();
  if (now < cycle.start) return 0;
  if (now > cycle.end) return 100;
  
  const totalDays = getDaysInCycle(cycle);
  const daysPassed = Math.ceil((now.getTime() - cycle.start.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.round((daysPassed / totalDays) * 100);
};