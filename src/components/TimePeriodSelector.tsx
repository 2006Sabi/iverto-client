import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

interface TimePeriodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (period: string) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('day');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [timeValue, setTimeValue] = useState<string>('09:00');

  const handleSelect = (period: string) => {
    onSelect(period);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Comparison Period</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Select Period Type</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedPeriod === 'day' && (
            <div>
              <Label>Select Date & Time</Label>
              <div className="grid grid-cols-2 gap-4">
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
          )}

          {selectedPeriod === 'week' && (
            <div>
              <Label>Select Week Range</Label>
              <div className="grid grid-cols-2 gap-4">
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
          )}

          {selectedPeriod === 'month' && (
            <div>
              <Label>Select Month</Label>
              <div className="grid grid-cols-2 gap-4">
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
          )}

          {selectedPeriod === 'year' && (
            <div>
              <Label>Select Year</Label>
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
          )}

          <Button onClick={() => handleSelect(selectedPeriod)} className="w-full">
            Select Period
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
  );
};

export default TimePeriodSelector;
