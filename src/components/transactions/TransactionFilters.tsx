import React, { useState } from 'react';
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { CardType, FilterOptions } from '../../types';
import { CREDIT_CARDS } from '../../constants/creditCards';
import Button from '../common/Button';

interface TransactionFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalResults,
}) => {
  const [expanded, setExpanded] = useState<string | false>('basic');
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [amountRange, setAmountRange] = useState<number[]>([0, 10000]);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setLocalFilters({ ...localFilters, searchTerm });
    // Debounce search
    const timer = setTimeout(() => {
      onFilterChange({ ...localFilters, searchTerm });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleCardTypeChange = (cardType: CardType | '') => {
    const newFilters = {
      ...localFilters,
      cardType: cardType || undefined,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category: string | '') => {
    const newFilters = {
      ...localFilters,
      category: category || undefined,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : new Date();
    const dateRange = localFilters.dateRange || { start: new Date(), end: new Date() };
    const newDateRange = {
      ...dateRange,
      [field]: date,
    };
    const newFilters = {
      ...localFilters,
      dateRange: newDateRange,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAmountRangeChange = (event: Event, newValue: number | number[]) => {
    setAmountRange(newValue as number[]);
  };

  const handleAmountRangeCommit = () => {
    const newFilters = {
      ...localFilters,
      amountRange: {
        min: amountRange[0],
        max: amountRange[1],
      },
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    setAmountRange([0, 10000]);
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.cardType) count++;
    if (filters.category) count++;
    if (filters.dateRange) count++;
    if (filters.amountRange) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Get categories based on selected card
  const getCategories = () => {
    if (!localFilters.cardType) {
      // Return all categories from both cards
      const allCategories: { id: string; name: string }[] = [];
      Object.values(CREDIT_CARDS).forEach(card => {
        card.categories.forEach(cat => {
          if (!allCategories.find(c => c.id === cat.id)) {
            allCategories.push({ id: cat.id, name: cat.name });
          }
        });
      });
      return allCategories;
    }
    return CREDIT_CARDS[localFilters.cardType].categories;
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilterIcon className="text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} active`}
              size="small"
              color="primary"
              variant="filled"
            />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalResults} results
          </span>
          {activeFilterCount > 0 && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              icon={<ClearIcon fontSize="small" />}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <TextField
          fullWidth
          placeholder="Search transactions..."
          value={localFilters.searchTerm || ''}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-400" />
              </InputAdornment>
            ),
            endAdornment: localFilters.searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setLocalFilters({ ...localFilters, searchTerm: undefined });
                    onFilterChange({ ...localFilters, searchTerm: undefined });
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg"
        />
      </div>

      {/* Filter Accordions */}
      <div className="space-y-2">
        {/* Basic Filters */}
        <Accordion
          expanded={expanded === 'basic'}
          onChange={handleAccordionChange('basic')}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Basic Filters
            </span>
          </AccordionSummary>
          <AccordionDetails>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Type Filter */}
              <FormControl fullWidth size="small">
                <InputLabel>Credit Card</InputLabel>
                <Select
                  value={localFilters.cardType || ''}
                  onChange={(e) => handleCardTypeChange(e.target.value as CardType | '')}
                  label="Credit Card"
                >
                  <MenuItem value="">All Cards</MenuItem>
                  <MenuItem value="AXIS_AIRTEL">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded gradient-airtel" />
                      Axis Airtel
                    </div>
                  </MenuItem>
                  <MenuItem value="FLIPKART_AXIS">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded gradient-flipkart" />
                      Flipkart Axis
                    </div>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Category Filter */}
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={localFilters.category || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {getCategories().map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Date Range Filter */}
        <Accordion
          expanded={expanded === 'date'}
          onChange={handleAccordionChange('date')}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Date Range
            </span>
          </AccordionSummary>
          <AccordionDetails>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Start Date"
                type="date"
                value={formatDateForInput(localFilters.dateRange?.start)}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={formatDateForInput(localFilters.dateRange?.end)}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Amount Range Filter */}
        <Accordion
          expanded={expanded === 'amount'}
          onChange={handleAccordionChange('amount')}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Amount Range
            </span>
          </AccordionSummary>
          <AccordionDetails>
            <div className="px-3">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ₹{amountRange[0].toLocaleString()}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ₹{amountRange[1].toLocaleString()}
                </span>
              </div>
              <Slider
                value={amountRange}
                onChange={handleAmountRangeChange}
                onChangeCommitted={handleAmountRangeCommit}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                min={0}
                max={50000}
                step={100}
                marks={[
                  { value: 0, label: '₹0' },
                  { value: 10000, label: '₹10K' },
                  { value: 25000, label: '₹25K' },
                  { value: 50000, label: '₹50K' },
                ]}
              />
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {localFilters.cardType && (
              <Chip
                label={`Card: ${localFilters.cardType === 'AXIS_AIRTEL' ? 'Axis Airtel' : 'Flipkart Axis'}`}
                onDelete={() => handleCardTypeChange('')}
                size="small"
                className="bg-purple-100 dark:bg-purple-900"
              />
            )}
            {localFilters.category && (
              <Chip
                label={`Category: ${localFilters.category}`}
                onDelete={() => handleCategoryChange('')}
                size="small"
                className="bg-blue-100 dark:bg-blue-900"
              />
            )}
            {localFilters.dateRange && (
              <Chip
                label={`Date Range`}
                onDelete={() => {
                  const newFilters = { ...localFilters, dateRange: undefined };
                  setLocalFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                size="small"
                className="bg-green-100 dark:bg-green-900"
              />
            )}
            {localFilters.amountRange && (
              <Chip
                label={`₹${localFilters.amountRange.min} - ₹${localFilters.amountRange.max}`}
                onDelete={() => {
                  setAmountRange([0, 10000]);
                  const newFilters = { ...localFilters, amountRange: undefined };
                  setLocalFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                size="small"
                className="bg-orange-100 dark:bg-orange-900"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;