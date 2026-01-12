import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePreset } from '@/types/reports';

interface DateRangePickerProps {
  from: Date;
  to: Date;
  preset?: DatePreset;
  onDateRangeChange: (from: Date, to: Date, preset?: DatePreset) => void;
  onPresetChange: (preset: DatePreset) => void;
  datePresets: Record<DatePreset, { label: string; getDates: () => { from: Date; to: Date } }>;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  preset,
  onDateRangeChange,
  onPresetChange,
  datePresets,
  className
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    from,
    to
  });

  const handlePresetChange = (newPreset: DatePreset) => {
    if (newPreset === 'custom') {
      // Keep current dates for custom
      onDateRangeChange(from, to, newPreset);
    } else {
      const dates = datePresets[newPreset].getDates();
      onDateRangeChange(dates.from, dates.to, newPreset);
      setSelectedRange({ from: dates.from, to: dates.to });
    }
    onPresetChange(newPreset);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      onDateRangeChange(range.from, range.to, 'custom');
      onPresetChange('custom');
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (preset && preset !== 'custom') {
      return datePresets[preset].label;
    }
    return `${format(from, 'MMM dd, yyyy')} - ${format(to, 'MMM dd, yyyy')}`;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Preset Selector */}
      <Select value={preset || 'custom'} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecionar período" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(datePresets).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Date Range Picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={from}
            selected={selectedRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}