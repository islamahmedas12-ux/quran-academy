"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Star, ChevronRight, Check } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  avatar: string | null;
  bio: string;
  specialization: string[];
  rating: number;
  totalClasses: number;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface ClassBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onBookClass: (teacherId: string, slotId: string, topic: string) => void;
}

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

function Step1SelectTeacher({ teachers, selectedTeacher, onSelect }: { teachers: Teacher[]; selectedTeacher: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Select a Teacher</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {teachers.map((teacher) => (
          <button
            key={teacher.id}
            onClick={() => onSelect(teacher.id)}
            className={cn(
              "text-left p-4 rounded-xl border-2 transition-all",
              selectedTeacher === teacher.id
                ? "border-primary bg-primary/5"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar name={teacher.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{teacher.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium">{teacher.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {teacher.specialization.slice(0, 3).map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{teacher.bio}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2SelectTime({
  selectedTeacher,
  onSelectSlot,
  selectedSlot,
}: {
  selectedTeacher: Teacher | null;
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
}) {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const timeSlots: TimeSlot[] = [
    { id: "1", startTime: "09:00", endTime: "10:00", isAvailable: true },
    { id: "2", startTime: "10:00", endTime: "11:00", isAvailable: true },
    { id: "3", startTime: "11:00", endTime: "12:00", isAvailable: false },
    { id: "4", startTime: "14:00", endTime: "15:00", isAvailable: true },
    { id: "5", startTime: "15:00", endTime: "16:00", isAvailable: true },
    { id: "6", startTime: "16:00", endTime: "17:00", isAvailable: false },
  ];

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Select a Time</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dates.map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex-shrink-0 w-16 py-2 rounded-lg border text-center transition-colors",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <p className="text-xs opacity-70">
                {date.toLocaleDateString("en", { weekday: "short" })}
              </p>
              <p className="text-lg font-semibold">{date.getDate()}</p>
            </button>
          );
        })}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.isAvailable && onSelectSlot(slot.id)}
            disabled={!slot.isAvailable}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-colors",
              !slot.isAvailable
                ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                : selectedSlot === slot.id
                ? "border-primary bg-primary text-white"
                : "border-slate-200 hover:border-primary"
            )}
          >
            <Clock className="h-4 w-4" />
            {slot.startTime} - {slot.endTime}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3Confirm({
  teacher,
  slot,
  onConfirm,
  topic,
  onTopicChange,
  isLoading,
}: {
  teacher: Teacher | null;
  slot: TimeSlot | null;
  topic: string;
  onTopicChange: (topic: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Confirm Booking</h3>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <Avatar name={teacher?.name || ""} size="lg" />
            <div>
              <p className="font-medium">{teacher?.name}</p>
              <div className="flex gap-1 mt-1">
                {teacher?.specialization.slice(0, 2).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date().toLocaleDateString("en", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <span>
              {slot?.startTime} - {slot?.endTime}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              What would you like to focus on?
            </label>
            <textarea
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              placeholder="e.g., Tajweed practice, Surah Al-Fatihah recitation..."
              className="w-full h-24 px-3 py-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>
      <Button onClick={onConfirm} isLoading={isLoading} className="w-full">
        Confirm Booking
      </Button>
    </div>
  );
}

export function ClassBookingModal({
  isOpen,
  onClose,
  teachers,
  onBookClass,
}: ClassBookingModalProps) {
  const [step, setStep] = React.useState(1);
  const [selectedTeacher, setSelectedTeacher] = React.useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [topic, setTopic] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedTeacherObj = teachers.find((t) => t.id === selectedTeacher) || null;

  const timeSlots: TimeSlot[] = [
    { id: "1", startTime: "09:00", endTime: "10:00", isAvailable: true },
    { id: "2", startTime: "10:00", endTime: "11:00", isAvailable: true },
    { id: "3", startTime: "11:00", endTime: "12:00", isAvailable: false },
    { id: "4", startTime: "14:00", endTime: "15:00", isAvailable: true },
    { id: "5", startTime: "15:00", endTime: "16:00", isAvailable: true },
    { id: "6", startTime: "16:00", endTime: "17:00", isAvailable: false },
  ];

  const selectedSlotObj = timeSlots.find((s) => s.id === selectedSlot) || null;

  const handleConfirm = async () => {
    if (!selectedTeacher || !selectedSlot) return;
    setIsLoading(true);
    await onBookClass(selectedTeacher, selectedSlot, topic);
    setIsLoading(false);
    onClose();
    setStep(1);
    setSelectedTeacher(null);
    setSelectedSlot(null);
    setTopic("");
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleBack} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Book a Class</h2>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-8 h-2 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 1 && (
            <Step1SelectTeacher
              teachers={teachers}
              selectedTeacher={selectedTeacher}
              onSelect={(id) => setSelectedTeacher(id)}
            />
          )}
          {step === 2 && (
            <Step2SelectTime
              selectedTeacher={selectedTeacherObj}
              selectedSlot={selectedSlot}
              onSelectSlot={(id) => setSelectedSlot(id)}
            />
          )}
          {step === 3 && (
            <Step3Confirm
              teacher={selectedTeacherObj}
              slot={selectedSlotObj}
              topic={topic}
              onTopicChange={setTopic}
              onConfirm={handleConfirm}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 3 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !selectedTeacher) ||
                (step === 2 && !selectedSlot)
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
