import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CalendarDays, TrendingUp, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface ComparisonPeriod {
  type: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate?: Date;
  description: string;
}

interface AIReportCompareProps {
  isOpen: boolean;
  onClose: () => void;
  onCompare: (period: ComparisonPeriod) => void;
}

const AIReportCompare: React.FC<AIReportCompareProps> = ({ isOpen, onClose, onCompare }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ComparisonPeriod['type']>('day');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [timeValue, setTimeValue] = useState<string>('09:00');

  const getPeriodDescription = (type: ComparisonPeriod['type']): string => {
    switch (type) {
      case 'day':
        return 'Compare data for a specific day and time';
      case 'week':
        return 'Compare data for a specific week range';
      case 'month':
        return 'Compare data for a specific month';
      case 'year':
        return 'Compare data for a specific year';
      default:
        return 'Select a time period to compare';
    }
  };

  const handleCompare = () => {
    const period: ComparisonPeriod = {
      type: selectedPeriod,
      startDate,
      endDate,
      description: getPeriodDescription(selectedPeriod)
    };
    onCompare(period);
    onClose();
  };

  const renderDaySelector = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Date & Time</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label className="text-sm">Date</Label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              className="rounded-md border"
            />
          </div>
          <div>
            <Label className="text-sm">Time</Label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeekSelector = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Week Range</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label className="text-sm">Start Date</Label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              className="rounded-md border"
            />
          </div>
          <div>
            <Label className="text-sm">End Date</Label>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && setEndDate(date)}
              className="rounded-md border"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonthSelector = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Month</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label className="text-sm">Month</Label>
            <Select value={format(startDate, 'MM')} onValueChange={(value) => {
              const newDate = new Date(startDate.getFullYear(), parseInt(value) - 1, 1);
              setStartDate(newDate);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={(i + 1).toString().padStart(2, '0')}>
                    {format(new Date(2024, i, 1), 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Year</Label>
            <Input
              type="number"
              value={startDate.getFullYear()}
              onChange={(e) => {
                const year = parseInt(e.target.value);
                setStartDate(new Date(year, startDate.getMonth(), 1));
              }}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderYearSelector = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Year</Label>
        <div className="mt-2">
          <Label className="text-sm">Year</Label>
          <Input
            type="number"
            value={startDate.getFullYear()}
            onChange={(e) => {
              const year = parseInt(e.target.value);
              setStartDate(new Date(year, 0, 1));
            }}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderPeriodSelector = () => {
    switch (selectedPeriod) {
      case 'day':
        return renderDaySelector();
      case 'week':
        return renderWeekSelector();
      case 'month':
        return renderMonthSelector();
      case 'year':
        return renderYearSelector();
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Compare AI Reports
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Period Type Selection */}
          <div>
            <Label>Select Comparison Period</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <Button
                variant={selectedPeriod === 'day' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('day')}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs">Day</span>
              </Button>
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('week')}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs">Week</span>
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('month')}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs">Month</span>
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('year')}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs">Year</span>
              </Button>
            </div>
          </div>

          {/* Period Specific Selector */}
          <div className="border-t pt-4">
            {renderPeriodSelector()}
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">{getPeriodDescription(selectedPeriod)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCompare} className="bg-[#cd0447] hover:bg-[#cd0447]/90">
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIReportCompare;
