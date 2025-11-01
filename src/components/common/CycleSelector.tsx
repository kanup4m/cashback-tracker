import React, { useState } from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Popover,
  TextField,
  Box,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  ViewQuilt as QuarterIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { CycleType, CycleDateRange } from '../../types';
import Button from './Button';

interface CycleSelectorProps {
  currentCycle: CycleType;
  onCycleChange: (cycle: CycleType) => void;
  cycleRange: CycleDateRange;
  onCustomDateChange: (start: Date, end: Date) => void;
}

const CycleSelector: React.FC<CycleSelectorProps> = ({
  currentCycle,
  onCycleChange,
  cycleRange,
  onCustomDateChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [customStartDate, setCustomStartDate] = useState<string>(
    format(cycleRange.start, 'yyyy-MM-dd')
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    format(cycleRange.end, 'yyyy-MM-dd')
  );

  const handleCycleChange = (event: React.MouseEvent<HTMLElement>, newCycle: CycleType | null) => {
    if (newCycle) {
      onCycleChange(newCycle);
      if (newCycle === 'CUSTOM') {
        setAnchorEl(event.currentTarget);
      }
    }
  };

  const handleCustomDateSubmit = () => {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    
    if (start <= end) {
      onCustomDateChange(start, end);
      setAnchorEl(null);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Billing Cycle
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {cycleRange.label}
          </p>
        </div>

        <ToggleButtonGroup
          value={currentCycle}
          exclusive
          onChange={handleCycleChange}
          aria-label="billing cycle"
          className="bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <ToggleButton 
            value="STATEMENT" 
            aria-label="statement cycle"
            className="px-3 py-2"
          >
            <TodayIcon className="mr-2" fontSize="small" />
            <span className="hidden sm:inline">Statement</span>
          </ToggleButton>
          
          <ToggleButton 
            value="CALENDAR" 
            aria-label="calendar month"
            className="px-3 py-2"
          >
            <CalendarIcon className="mr-2" fontSize="small" />
            <span className="hidden sm:inline">Calendar</span>
          </ToggleButton>
          
          <ToggleButton 
            value="QUARTERLY" 
            aria-label="quarterly"
            className="px-3 py-2"
          >
            <QuarterIcon className="mr-2" fontSize="small" />
            <span className="hidden sm:inline">Quarterly</span>
          </ToggleButton>
          
          <ToggleButton 
            value="CUSTOM" 
            aria-label="custom range"
            className="px-3 py-2"
          >
            <DateRangeIcon className="mr-2" fontSize="small" />
            <span className="hidden sm:inline">Custom</span>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* Custom Date Range Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box className="p-4 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-4">Select Date Range</h3>
          
          <TextField
            label="Start Date"
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            label="End Date"
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: customStartDate }}
          />
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleCustomDateSubmit}
              variant="primary"
              fullWidth
            >
              Apply
            </Button>
            <Button
              onClick={handlePopoverClose}
              variant="ghost"
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Popover>

      {/* Cycle Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Cycle Progress</span>
          <span>{Math.round((cycleRange as any).progress || 0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(cycleRange as any).progress || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CycleSelector;