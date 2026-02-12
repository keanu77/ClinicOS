'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthNavigatorProps {
  year: number;
  month: number;
  onNavigate: (year: number, month: number) => void;
}

export function MonthNavigator({ year, month, onNavigate }: MonthNavigatorProps) {
  const goToPrevMonth = () => {
    if (month === 1) {
      onNavigate(year - 1, 12);
    } else {
      onNavigate(year, month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      onNavigate(year + 1, 1);
    } else {
      onNavigate(year, month + 1);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    onNavigate(now.getFullYear(), now.getMonth() + 1);
  };

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="icon" onClick={goToPrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold">
          {year}年{month}月
        </span>
        <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
          本月
        </Button>
      </div>
      <Button variant="outline" size="icon" onClick={goToNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
