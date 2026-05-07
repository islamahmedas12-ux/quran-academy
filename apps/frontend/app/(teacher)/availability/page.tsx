"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/hooks/useToast";
import { Clock, Save, Plus, Trash2 } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
});

export default function TeacherAvailabilityPage() {
  const [availability, setAvailability] = React.useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockSlots: AvailabilitySlot[] = [
      { id: "1", dayOfWeek: 1, startTime: "09:00", endTime: "12:00", isActive: true },
      { id: "2", dayOfWeek: 1, startTime: "14:00", endTime: "17:00", isActive: true },
      { id: "3", dayOfWeek: 2, startTime: "09:00", endTime: "12:00", isActive: true },
      { id: "4", dayOfWeek: 2, startTime: "14:00", endTime: "17:00", isActive: true },
      { id: "5", dayOfWeek: 3, startTime: "10:00", endTime: "15:00", isActive: true },
      { id: "6", dayOfWeek: 4, startTime: "09:00", endTime: "12:00", isActive: false },
      { id: "7", dayOfWeek: 5, startTime: "09:00", endTime: "14:00", isActive: true },
      { id: "8", dayOfWeek: 6, startTime: "10:00", endTime: "13:00", isActive: true },
    ];
    setAvailability(mockSlots);
    setIsLoading(false);
  }, []);

  const handleToggleSlot = (slotId: string) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
      )
    );
  };

  const handleDeleteSlot = (slotId: string) => {
    setAvailability((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const handleAddSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      id: `new-${Date.now()}`,
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    };
    setAvailability((prev) => [...prev, newSlot]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("Availability saved successfully!", "success");
    } catch {
      showToast("Failed to save availability. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getSlotsByDay = (day: number) =>
    availability.filter((slot) => slot.dayOfWeek === day);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Availability</h1>
          <p className="text-muted-foreground">
            Set your weekly recurring availability for bookings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Weekly Recurring Slots</p>
              <p className="text-sm text-muted-foreground mt-1">
                Students will be able to book classes during your available time
                slots. You can add multiple slots per day and toggle them
                on/off as needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability by Day */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => {
          const daySlots = getSlotsByDay(day.value);
          const hasActiveSlots = daySlots.some((s) => s.isActive);

          return (
            <Card key={day.value}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>{day.label}</CardTitle>
                    <Badge variant={hasActiveSlots ? "success" : "secondary"}>
                      {hasActiveSlots
                        ? `${daySlots.filter((s) => s.isActive).length} slots`
                        : "Unavailable"}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSlot(day.value)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {daySlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No availability set for {day.label}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          slot.isActive
                            ? "bg-primary/5 border-primary/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSlot(slot.id)}
                          className={
                            slot.isActive
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        >
                          {slot.isActive ? "Active" : "Inactive"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
