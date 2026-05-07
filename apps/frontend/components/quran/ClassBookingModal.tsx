"use client";

import * as React from "react";
import { X, Calendar, Clock, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Teacher } from "@/lib/types";

interface ClassBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  selectedVerse?: string;
  onConfirm: (notes: string) => void;
  isLoading?: boolean;
}

export function ClassBookingModal({
  isOpen,
  onClose,
  teacher,
  selectedVerse,
  onConfirm,
  isLoading,
}: ClassBookingModalProps) {
  const [notes, setNotes] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");

  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    };
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  ];

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(notes);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Book a Class
          </DialogTitle>
        </DialogHeader>

        {teacher && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Avatar name={teacher.name} src={teacher.avatar} size="md" />
            <div>
              <p className="font-medium">{teacher.name}</p>
              <p className="text-sm text-slate-500">{teacher.specialization[0]}</p>
            </div>
          </div>
        )}

        {selectedVerse && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-slate-600">For verse:</p>
            <p className="font-arabic text-right" dir="rtl">{selectedVerse}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Date</label>
            <div className="grid grid-cols-7 gap-1">
              {availableDates.map((date) => (
                <button
                  key={date.value}
                  onClick={() => setSelectedDate(date.value)}
                  className={cn(
                    "p-2 text-xs rounded-lg border transition-colors",
                    selectedDate === date.value
                      ? "bg-primary text-white border-primary"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {date.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Time</label>
            <div className="grid grid-cols-6 gap-1">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "p-2 text-xs rounded-lg border transition-colors",
                    selectedTime === time
                      ? "bg-primary text-white border-primary"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific topics or questions..."
              className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}