"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  disableWeekends?: boolean;
  locale?: "en" | "ar";
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  minDate,
  maxDate,
  disablePast = false,
  disableWeekends = false,
  locale = "en",
  className,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());
  const [focusedDate, setFocusedDate] = React.useState(selected || new Date());

  const dateLocale = locale === "ar" ? ar : enUS;

  const days = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dayArray: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      dayArray.push(day);
      day = addDays(day, 1);
    }

    return dayArray;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isDateDisabled = (date: Date) => {
    if (disablePast && date < startOfToday()) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disableWeekends) {
      const day = date.getDay();
      if (day === 5 || day === 6) return true;
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onSelect?.(date);
    }
  };

  const weekDays = locale === "ar" ? ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Previous month"
        >
          <ChevronRight className="h-5 w-5 rtl:rotate-180" />
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
        </h2>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Next month"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isDisabled = isDateDisabled(day);
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={cn(
                "h-10 w-10 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !isCurrentMonth && "text-muted-foreground opacity-0",
                isCurrentMonth && "text-foreground",
                isSelected && "bg-primary text-white hover:bg-primary-hover",
                isDayToday && !isSelected && "border border-primary",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ visibility: isCurrentMonth ? "visible" : "hidden" }}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { Calendar };
