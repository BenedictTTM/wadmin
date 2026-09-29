'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export interface CalendarProps {
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

export function Calendar({
  selectedDate,
  onSelectDate,
  className,
}: CalendarProps): React.JSX.Element {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date(),
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleString('en-US', { month: 'long' });

  // First day of month & number of days
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  return (
    <div className={cn('p-3 select-none w-64', className)}>
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-3">
        <span className="text-xs font-semibold text-slate-800">
          {monthName} {year}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="h-6 w-6 text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-6 w-6 text-slate-500 hover:text-slate-900"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 mb-1">
        {daysOfWeek.map((d) => (
          <div key={d} className="py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-7 w-7" />;
          }

          const selected = isSelected(day);
          const today = isToday(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => onSelectDate?.(new Date(year, month, day))}
              className={cn(
                'h-7 w-7 rounded-md text-xs font-medium transition-colors flex items-center justify-center',
                selected
                  ? 'bg-indigo-600 text-white font-semibold'
                  : today
                    ? 'border border-indigo-300 text-indigo-700 bg-indigo-50/50'
                    : 'text-slate-700 hover:bg-slate-100',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
