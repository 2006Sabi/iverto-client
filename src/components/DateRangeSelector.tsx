import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Start Date</Label>
        <Calendar
          mode="single"
          selected={startDate}
          onSelect={onStartDateChange}
          className="rounded-md border"
        />
      </div>
      <div>
        <Label>End Date</Label>
        <Calendar
          mode="single"
          selected={endDate}
          onSelect={onEndDateChange}
          className="rounded-md border"
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;
