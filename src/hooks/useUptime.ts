import { useState, useEffect } from 'react';

interface UptimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export const useUptime = (startTime?: string | Date): UptimeData => {
  const [uptime, setUptime] = useState<UptimeData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    formatted: '0d 0h 0m'
  });

  useEffect(() => {
    if (!startTime) {
      return;
    }

    const startDate = new Date(startTime);
    
    const updateUptime = () => {
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();
      
      if (diff < 0) {
        // If start time is in the future, show 0 uptime
        setUptime({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          formatted: '0d 0h 0m'
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Format the uptime string
      let formatted = '';
      if (days > 0) {
        formatted += `${days}d `;
      }
      if (hours > 0 || days > 0) {
        formatted += `${hours}h `;
      }
      formatted += `${minutes}m`;

      setUptime({
        days,
        hours,
        minutes,
        seconds,
        formatted
      });
    };

    // Update immediately
    updateUptime();

    // Update every second
    const interval = setInterval(updateUptime, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return uptime;
}; 